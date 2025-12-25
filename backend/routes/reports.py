from flask import Blueprint, jsonify, request, Response, make_response
from database import DatabaseManager
from utils.response import success_response, error_response
import logging
import json
from datetime import datetime
import csv
import io

reports_bp = Blueprint('reports', __name__)
logger = logging.getLogger(__name__)
db = DatabaseManager()

def generate_report_data(report_type, filters=None):
    """Generates actual data based on report type and filters"""
    data = {}
    filters = filters or {}
    
    # Date filtering helpers
    date_filter = filters.get('date')
    month_filter = filters.get('month') # "YYYY-MM"
    year_filter = filters.get('year') # "YYYY"
    week_start = filters.get('week_start') # "YYYY-MM-DD"

    start_date = None
    end_date = None

    if report_type == 'Daily' and date_filter:
        start_date = date_filter
        end_date = date_filter
    elif report_type == 'Weekly' and week_start:
         start_date = week_start
         # End date is start + 6 days (logic could be in SQL or python)
    elif report_type == 'Monthly' and month_filter:
        # Construct start and end of month
        start_date = f"{month_filter}-01"
        # end date logic simplified for SQL 'LIKE' or range
    elif report_type == 'Yearly' and year_filter:
         start_date = f"{year_filter}-01-01"
         end_date = f"{year_filter}-12-31"

    # --- REPORT LOGIC ---

    if report_type == 'Inventory Log':
        goats = db.execute_query("SELECT * FROM goats")
        data['total_count'] = len(goats)
        data['records'] = [dict(g) for g in goats]
        data['summary'] = f"Complete inventory as of {datetime.now().strftime('%Y-%m-%d')}"
        
    elif report_type == 'Feeding Log':
        base_query = "SELECT * FROM feeding_records"
        params = []
        if start_date: 
             # Simple filter for now, can be expanded
             if report_type == 'Daily':
                 base_query += " WHERE date(timestamp) = ?"
                 params.append(start_date)
             elif report_type == 'Monthly':
                  base_query += " WHERE strftime('%Y-%m', timestamp) = ?"
                  params.append(month_filter)

        base_query += " ORDER BY timestamp DESC LIMIT 100" # Cap at 100 for performance
        records = db.execute_query(base_query, tuple(params))
        data['total_records'] = len(records)
        data['records'] = [dict(r) for r in records]
    
    elif report_type == 'Activity Log':
        base_query = "SELECT * FROM events WHERE event_type != 'System Alert'"
        params = []
        if date_filter:
            base_query += " AND date(timestamp) = ?"
            params.append(date_filter)
        
        base_query += " ORDER BY timestamp DESC LIMIT 100"
        events = db.execute_query(base_query, tuple(params))
        data['total_events'] = len(events)
        data['records'] = [dict(e) for e in events]

    elif report_type == 'Health Summary':
        # Get latest health stats
        health_counts = db.execute_query("""
            SELECT status, COUNT(*) as count 
            FROM health_records 
            GROUP BY status
        """)
        
        distribution = {row['status']: row['count'] for row in health_counts}
        
        # Calculate scores
        avg_score = db.execute_query("SELECT AVG(health_score) as avg FROM health_records")[0]['avg']
        
        data['health_distribution'] = distribution
        data['key_metrics'] = {
            'average_health_score': avg_score or 0,
            'critical_cases': distribution.get('Critical', 0),
            'sick_cases': distribution.get('Poor', 0)
        }
        
    elif report_type == 'Production Yield':
        # Mock yield calculation based on weight
        goats = db.execute_query("SELECT ear_tag, breed, weight FROM goats WHERE weight IS NOT NULL")
        details = []
        total_meat = 0
        
        for g in goats:
            # Simple estimation: carcass yield is roughly 50% of live weight
            yield_kg = g['weight'] * 0.5
            details.append({
                'ear_tag': g['ear_tag'],
                'breed': g['breed'],
                'weight_kg': g['weight'],
                'projected_meat_kg': round(yield_kg, 2)
            })
            total_meat += yield_kg
            
        data['total_heads'] = len(goats)
        data['total_projected_meat_kg'] = round(total_meat, 2)
        data['details'] = details
        
    elif report_type in ['Daily', 'Weekly', 'Monthly', 'Yearly']:
        # Generic Period Summary
        target_date = date_filter or datetime.now().strftime('%Y-%m-%d')
        
        # Period logic for queries
        date_condition = f"date(created_at) = '{target_date}'"
        if report_type == 'Monthly' and month_filter:
             date_condition = f"strftime('%Y-%m', created_at) = '{month_filter}'"
        elif report_type == 'Yearly' and year_filter:
             date_condition = f"strftime('%Y', created_at) = '{year_filter}'"
        elif report_type == 'Weekly' and week_start:
             date_condition = f"date(created_at) >= '{week_start}' AND date(created_at) <= date('{week_start}', '+6 days')"

        new_goats = db.execute_query(f"SELECT COUNT(*) as count FROM goats WHERE {date_condition}")[0]['count']
        
        # Alerts query needs timestamp
        alert_date_condition = date_condition.replace('created_at', 'timestamp')
        alerts = db.execute_query(f"SELECT COUNT(*) as count FROM events WHERE {alert_date_condition}")[0]['count']
        
        health_avg = db.execute_query(f"SELECT AVG(health_score) as avg FROM health_records WHERE {alert_date_condition}")[0]['avg']

        data['period'] = report_type
        data['filter_value'] = target_date if report_type == 'Daily' else (month_filter or year_filter or week_start)
        data['stats'] = {
            'New Goats': new_goats,
            'Alerts Generated': alerts,
            'Avg Health Score': float(round(health_avg, 2)) if health_avg else 0,
            'System Status': "Optimal"
        }
        data['events_summary'] = "No critical system events recorded." # Placeholder
        
    else:
        # Default empty
        data['message'] = "No specific data generator for this type."
        
    return data

@reports_bp.route('/reports', methods=['GET'])
def get_reports():
    try:
        query = "SELECT * FROM reports ORDER BY created_at DESC"
        reports = db.execute_query(query)
        # Parse data JSON for list view if needed (optional)
        return success_response({"reports": [dict(r) for r in reports]})
    except Exception as e:
        logger.error(f"Reports Error: {e}")
        return error_response(str(e))

@reports_bp.route('/reports/<int:report_id>', methods=['GET'])
def get_report(report_id):
    try:
        query = "SELECT * FROM reports WHERE report_id = ?"
        report = db.execute_query(query, (report_id,))
        if not report:
            return error_response("Report not found", 404)
        
        r_data = dict(report[0])
        
        if r_data.get('data'):
            try:
                content = json.loads(r_data.pop('data'))
                if isinstance(content, dict):
                    r_data.update(content)
            except:
                pass 
        
        return success_response(r_data)
    except Exception as e:
        logger.error(f"Get Report Error: {e}")
        return error_response(str(e))

@reports_bp.route('/reports/generate', methods=['POST'])
def generate_report():
    try:
        data = request.json
        report_type = data.get('report_type')
        title = data.get('title')
        fmt = data.get('format', 'PDF')
        
        # Extract filters
        filters = {
            'date': data.get('date'),
            'month': data.get('month'),
            'year': data.get('year'),
            'week_start': data.get('week_start')
        }
        
        # 1. Generate Data
        report_content = generate_report_data(report_type, filters)
        json_content = json.dumps(report_content)
        
        # 2. Save to DB
        query = """
            INSERT INTO reports (report_type, title, description, format, generated_by, data)
            VALUES (?, ?, ?, ?, ?, ?)
        """
        report_id = db.execute_update(query, (
            report_type, 
            title, 
            f"Generated {report_type} report", 
            fmt, 
            "System", 
            json_content
        ))
        
        # Return success with data for preview
        return success_response({
            "message": "Report generated successfully",
            "report_id": report_id,
            "data": report_content
        })
    except Exception as e:
        logger.error(f"Generate Report Error: {e}")
        return error_response(str(e))

@reports_bp.route('/reports/<int:report_id>/download', methods=['GET'])
def download_report(report_id):
    try:
        query = "SELECT * FROM reports WHERE report_id = ?"
        report = db.execute_query(query, (report_id,))
        if not report:
            return error_response("Report not found", 404)
            
        r_data = dict(report[0])
        content_data = {}
        if r_data.get('data'):
             try:
                 content_data = json.loads(r_data['data'])
             except:
                 content_data = {"raw": r_data['data']}

        # CSV Download Logic
        if r_data['format'] == 'CSV' or request.args.get('format') == 'csv':
            si = io.StringIO()
            cw = csv.writer(si)
            
            # Flatten data for CSV
            if isinstance(content_data, dict):
                # Check for list structures (like Inventory Log)
                if 'records' in content_data and isinstance(content_data['records'], list):
                    keys = content_data['records'][0].keys() if content_data['records'] else []
                    cw.writerow(keys)
                    for row in content_data['records']:
                        cw.writerow([row.get(k) for k in keys])
                elif 'details' in content_data and isinstance(content_data['details'], list):
                     keys = content_data['details'][0].keys() if content_data['details'] else []
                     cw.writerow(keys)
                     for row in content_data['details']:
                         cw.writerow([row.get(k) for k in keys])
                else:
                    # Key-Value pairs
                    cw.writerow(['Metric', 'Value'])
                    for k, v in content_data.items():
                        if isinstance(v, (dict, list)):
                             cw.writerow([k, json.dumps(v)])
                        else:
                             cw.writerow([k, v])
            
            output = make_response(si.getvalue())
            output.headers["Content-Disposition"] = f"attachment; filename={r_data['title']}.csv"
            output.headers["Content-type"] = "text/csv"
            return output

        # Default: Return JSON as file
        return jsonify(content_data)

    except Exception as e:
        logger.error(f"Download Report Error: {e}")
        return error_response(str(e))
