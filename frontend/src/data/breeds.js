export const GOAT_BREEDS = [
    {
        id: 'boer',
        name: 'Boer Goat',
        origin: 'South Africa',
        category: 'Meat',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Boer_Goat_galore.jpg/1200px-Boer_Goat_galore.jpg',
        description: 'The Boer goat is a breed of goat that was developed in South Africa in the early 1900s for meat production. Their name "Boer" is from a Dutch word meaning "farmer". They are known for their fast growth rate, distinct white body with a red head, and excellent carcass qualities.',
        stats: {
            weight_male: '110 - 135 kg',
            weight_female: '90 - 100 kg',
            height: '78 cm (avg)',
            lifespan: '10 - 12 years'
        },
        traits: {
            hardiness: 'High',
            growth_rate: 'Very High',
            fertility: 'High',
            docility: 'Moderate'
        },
        nutrition: {
            protein_requirement: '16-18%',
            feed_type: 'Browse and quality hay',
            water_intake: '4-10 liters/day'
        },
        living_conditions: 'Thrives in hot, dry semi-desert climates but adaptable. Requires good fencing as they are heavy foragers.',
        favorite_foods: ['Acacia leaves', 'Lucerne (Alfalfa) hay', 'Corn-based grain mix', 'Brush and shrubs'],
        feeding_guide: {
            kids: 'Creep feed with 18% protein until weaning.',
            maintenance: 'Good quality forage usually sufficient.',
            pregnancy: 'Supplement with grain in last 6 weeks of gestation.',
            lactation: 'High energy diet required to support milk and kid growth.'
        }
    },
    {
        id: 'saanen',
        name: 'Saanen',
        origin: 'Switzerland',
        category: 'Dairy',
        image: 'https://upload.wikimedia.org/wikipedia/commons/f/ff/Saanenziege_auf_Weide_2.jpg',
        description: 'Saanen goats are a white or cream-colored breed of goat, named for the Saanen valley in Switzerland. They are known as the "Holsteins" of the goat world due to their extremely high milk production and large size.',
        stats: {
            weight_male: '80 - 100 kg',
            weight_female: '60 - 70 kg',
            height: '81 cm (min)',
            lifespan: '10 - 15 years'
        },
        traits: {
            milk_yield: 'Very High (3-4L/day)',
            temperament: 'Calm and mild',
            climate_tolerance: 'Prefers cool climates'
        },
        nutrition: {
            protein_requirement: '16-20%',
            feed_type: 'High quality alfalfa hay and grain',
            water_intake: '10-20 liters/day'
        },
        living_conditions: 'Needs shade and protection from direct hot sun along with good ventilation. Does best in cooler environments.',
        favorite_foods: ['Alfalfa hay', 'Dairy pellets', 'Beet pulp', 'Oats'],
        feeding_guide: {
            lactation: 'Free choice alfalfa hay + 1lb grain for every 3lbs milk produced.',
            dry_period: 'Reduce grain to prevent obesity but maintain mineral balance.',
            maintenance: 'Access to pasture and salt licks.'
        }
    },
    {
        id: 'nubian',
        name: 'Anglo-Nubian',
        origin: 'United Kingdom',
        category: 'Dual-Purpose (Meat/Dairy)',
        image: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Anglo_Nubian_goat_female.jpg',
        description: 'The Anglo-Nubian is a British breed of domestic goat. Originating from cross-breeding between native British goats and large lop-eared goats from India, the Middle East, and North Africa. They are famous for their high butterfat milk and vocal nature.',
        stats: {
            weight_male: '80 - 100 kg',
            weight_female: '60 - 70 kg',
            height: '80 cm (min)',
            lifespan: '10 - 15 years'
        },
        traits: {
            milk_fat: 'High (4-5%)',
            appearance: 'Long pendulous ears, roman nose',
            heat_tolerance: 'Excellent',
            vocal: 'High'
        },
        nutrition: {
            protein_requirement: '14-16%',
            feed_type: 'Diverse browse, hay, legume mix',
            water_intake: 'Moderate'
        },
        living_conditions: 'Adaptable to hot climates. Requires sturdy fencing and enrichment to prevent boredom.',
        favorite_foods: ['Legume hay', 'Sweet feed', 'Willow branches', 'Sunflower seeds'],
        feeding_guide: {
            general: 'Thrives on browse. Excellent for clearing brush.',
            dairy: 'Requires higher fat content in diet to support butterfat production.',
            kids: 'Vigorous eaters, watch for overfeeding.'
        }
    },
    {
        id: 'kiko',
        name: 'Kiko',
        origin: 'New Zealand',
        category: 'Meat',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Kiko_Goat_Buck.jpg/1200px-Kiko_Goat_Buck.jpg',
        description: 'The Kiko is a breed of meat goat from New Zealand. Kiko comes from the Māori word for flesh or meat. Developed for low maintenance and high survivability under harsh conditions without supplemental feeding.',
        stats: {
            weight_male: '100 - 120 kg',
            weight_female: '60 - 80 kg',
            height: '75 cm (avg)',
            lifespan: '8 - 12 years'
        },
        traits: {
            parasite_resistance: 'High',
            mothering_ability: 'Excellent',
            foraging_ability: 'Superior',
            hooves: 'Hard (less trimming)'
        },
        nutrition: {
            protein_requirement: '12-14%',
            feed_type: 'Aggressive foraging, pasture',
            water_intake: 'Standard'
        },
        living_conditions: 'Ideal for large, rough pastures. Highly resistant to parasites and foot rot. Can live outdoors year-round in most climates.',
        favorite_foods: ['Weeds (Thistles, Briars)', 'Brush', 'Grass', 'Mineral block'],
        feeding_guide: {
            maintenance: 'Can thrive on poor quality pasture where other breeds fail.',
            supplement: 'Minimal supplementation needed unless pasture is extremely poor.',
            breeding: 'Flush with grain 2 weeks before breeding.'
        }
    },
    {
        id: 'nigerian_dwarf',
        name: 'Nigerian Dwarf',
        origin: 'West Africa',
        category: 'Dairy',
        image: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/Nigerian_Dwarf_Goat.jpg',
        description: 'The Nigerian Dwarf is a miniature dairy goat from West Africa. Despite their small size, they produce a surprising amount of milk with very high butterfat content, making it ideal for cheese making.',
        stats: {
            weight_male: '25 - 35 kg',
            weight_female: '18 - 25 kg',
            height: '43 - 53 cm',
            lifespan: '12 - 15 years'
        },
        traits: {
            size: 'Small (Miniature)',
            milk_fat: 'Very High (6-10%)',
            breeding: 'Year-round breeder',
            personality: 'Friendly'
        },
        nutrition: {
            protein_requirement: '16%',
            feed_type: 'Quality hay and dairy ration',
            water_intake: 'Proportional to size'
        },
        living_conditions: 'Perfect for small acreages or backyards. Needs secure fencing to prevent predation and escaping.',
        favorite_foods: ['Leafy greens', 'Peanuts', 'Goat granola', 'Timothy hay'],
        feeding_guide: {
            general: 'Beware of obesity. Measure grain carefully.',
            lactation: 'High quality hay is essential for milk production relative to body weight.',
            treats: 'Limit fruits and sugary treats.'
        }
    },
    {
        id: 'alpine',
        name: 'Alpine',
        origin: 'French Alps',
        category: 'Dairy',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Alpine_goat_image.jpg/1200px-Alpine_goat_image.jpg',
        description: 'The Alpine is a medium to large sized breed of domestic goat known for its very good milking ability. They have no set colours or markings but have erect ears and a straight profile.',
        stats: {
            weight_male: '80 - 100 kg',
            weight_female: '60 - 70 kg',
            height: '76 cm (min)',
            lifespan: '10 - 15 years'
        },
        traits: {
            hardiness: 'Very Hardy',
            milk_production: 'High (Steady)',
            agility: 'High',
            ears: 'Erect'
        },
        nutrition: {
            protein_requirement: '16-18%',
            feed_type: 'Balanced dairy ration',
            water_intake: 'High'
        },
        living_conditions: 'Excellent range goats. They navigate steep and rocky terrain with ease. Tolerant of cold weather.',
        favorite_foods: ['Pine needles', 'Bark', 'Mixed grain', 'Clover'],
        feeding_guide: {
            lactation: 'Consistent feeding schedule yields best milk results.',
            maintenance: 'Do well on range but need extra energy during winter.'
        }
    },
    {
        id: 'lamancha',
        name: 'American LaMancha',
        origin: 'USA',
        category: 'Dairy',
        image: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Lamancha_goat.jpg',
        description: 'The LaMancha is a formally recognized breed of dairy goat, first bred in California by Mrs. Eula Fay Frey in 1927. They are best known for their very small ears (elf or gopher ears).',
        stats: {
            weight_male: '75 - 95 kg',
            weight_female: '55 - 70 kg',
            height: '71 cm (min)',
            lifespan: '10 - 15 years'
        },
        traits: {
            ears: 'Distinctive (Very small)',
            milk_fat: 'Moderate to High',
            temperament: 'Very Docile',
            milk_yield: 'High'
        },
        nutrition: {
            protein_requirement: '16%',
            feed_type: 'Alfalfa and dairy pellets',
            water_intake: 'High'
        },
        living_conditions: 'Does well in stall or pasture. Their small ears make them less prone to ear infections but more prone to sunburn.',
        favorite_foods: ['Carrots', 'Apples', 'Barley', 'Alfalfa pellets'],
        feeding_guide: {
            general: 'Easy keepers, efficient converters of feed to milk.',
            kids: 'Ensure colostrum intake immediately due to varying ear sizes making tagging tricky.'
        }
    },
    {
        id: 'toggenburg',
        name: 'Toggenburg',
        origin: 'Switzerland',
        category: 'Dairy',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Toggenburger_ziege_rechts.jpg/1200px-Toggenburger_ziege_rechts.jpg',
        description: 'The Toggenburg is the oldest registered breed of dairy goat. They are moderate in size, sturdy, vigorous, and alert. They have a distinctive Swiss marking pattern (white ears with dark spot, white facial stripes, white boots).',
        stats: {
            weight_male: '75 - 90 kg',
            weight_female: '55 - 65 kg',
            height: '66 cm (min)',
            lifespan: '10 - 15 years'
        },
        traits: {
            climate_tolerance: 'Excellent (Cold)',
            milk_production: 'Moderate',
            longevity: 'High',
            color: 'Light to dark brown'
        },
        nutrition: {
            protein_requirement: '15-17%',
            feed_type: 'Grass hay and grain',
            water_intake: 'Moderate'
        },
        living_conditions: 'Performs best in cooler conditions. Not well-suited for extreme heat. Needs good ventilation.',
        favorite_foods: ['Dandelion greens', 'Oats', 'Root vegetables', 'Barley'],
        feeding_guide: {
            winter: 'Increase roughage in winter to maintain body heat.',
            lactation: 'Respond well to consistency in ration composition.'
        }
    },
    {
        id: 'angora',
        name: 'Angora',
        origin: 'Turkey',
        category: 'Fiber (Mohair)',
        image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Angora_goat%2C_color.jpg',
        description: 'The Angora goat produces the lustrous fibre known as mohair. They are smaller than other goats and covered in thick, curly locks of hair. They require special care due to their energy investment in fiber production.',
        stats: {
            weight_male: '70 - 90 kg',
            weight_female: '40 - 50 kg',
            height: '65 - 75 cm',
            lifespan: '10 - 12 years'
        },
        traits: {
            fiber_production: 'Mohair',
            shear_frequency: 'Twice a year',
            vulnerability: 'Sensitive to cold',
            horns: 'Spiral (Both sexes)'
        },
        nutrition: {
            protein_requirement: 'Critical (for hair)',
            feed_type: 'Sulfur-rich diet',
            water_intake: 'High'
        },
        living_conditions: 'Must be protected from rain and cold, especially after shearing. Dry, clean bedding is essential to keep fleece clean.',
        favorite_foods: ['High-protein pellets', 'Cottonseed meal', 'Black oil sunflower seeds', 'Kelp meal'],
        feeding_guide: {
            fiber: 'Protein deficiency immediately affects mohair quality.',
            shorn: 'Provide high energy feed immediately after shearing to prevent hypothermia.'
        }
    },
    {
        id: 'pygmy',
        name: 'American Pygmy',
        origin: 'West Africa',
        category: 'Pet / Meat',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Pygmy_goat_1.jpg/800px-Pygmy_goat_1.jpg',
        description: 'The Pygmy is a breed of miniature domestic goat. They are kept primarily as pets but found their origins as meat goats. They are hardy, alert, and animated.',
        stats: {
            weight_male: '27 - 39 kg',
            weight_female: '24 - 34 kg',
            height: '40 - 50 cm',
            lifespan: '12 - 15 years'
        },
        traits: {
            size: 'Small (Cobby)',
            body_type: 'Heavy bone, muscular',
            temperament: 'Playful',
            hardiness: 'Adaptable'
        },
        nutrition: {
            protein_requirement: '12-14%',
            feed_type: 'Roughage dominant',
            water_intake: 'Low to Moderate'
        },
        living_conditions: 'Excellent pets for small backyards. They love to climb, so provide structures. Needs dry shelter.',
        favorite_foods: ['Vegetable scraps', 'Tree leaves', 'Grass hay', 'Cheerios (treat)'],
        feeding_guide: {
            warning: 'Prone to obesity and urinary calculi (stones) in males. Limit grain.',
            maintenance: 'Hay and water are usually sufficient for non-breeding adults.'
        }
    },
    {
        id: 'spanish',
        name: 'Spanish Goat',
        origin: 'Spain / USA',
        category: 'Meat / Brush',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Spanish_Goats.jpg/1200px-Spanish_Goats.jpg',
        description: 'Also known as the "brush goat", they are descendants of goats brought to the Americas by Spanish explorers. They are unrivaled in hardiness and ability to thrive on marginal lands.',
        stats: {
            weight_male: '80 - 110 kg',
            weight_female: '45 - 65 kg',
            height: 'Variable',
            lifespan: '10 - 12 years'
        },
        traits: {
            hardiness: 'Extreme',
            foraging: 'Exceptional',
            parasite_resistance: 'High',
            fertility: 'High'
        },
        nutrition: {
            protein_requirement: 'Low (Adaptable)',
            feed_type: 'Browse, Brush, Weeds',
            water_intake: 'Low'
        },
        living_conditions: 'Extensive range conditions. Best breed for clearing land of invasive plants.',
        favorite_foods: ['Cedar', 'Oak leaves', 'Poison Ivy', 'Brambles'],
        feeding_guide: {
            maintenance: 'Self-sufficient on good range.',
            management: 'Low input management style works best.'
        }
    },
    {
        id: 'myotonic',
        name: 'Myotonic (Fainting) Goat',
        origin: 'USA',
        category: 'Meat / Pet',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Fainting_Goat.jpg/1200px-Fainting_Goat.jpg',
        description: 'Famous for myotonia congenita, a hereditary condition that may cause them to stiffen or fall over when startled. This leads to heavy muscling, making them a good meat breed.',
        stats: {
            weight_male: '80 - 100 kg',
            weight_female: '50 - 65 kg',
            height: '43 - 64 cm',
            lifespan: '10 - 12 years'
        },
        traits: {
            muscling: 'Heavy',
            temperament: 'Docile / Anxious',
            activity_level: 'Low',
            myotonia: 'Stiffening'
        },
        nutrition: {
            protein_requirement: '14-16%',
            feed_type: 'Pasture and Hay',
            water_intake: 'Standard'
        },
        living_conditions: 'Safe, flat terrain is best to prevent injury when they "faint". Good fencing is needed not to keep them in, but to keep predators out as they cannot flee.',
        favorite_foods: ['Corn', 'Sweet potato vines', 'Clover hay', 'Fruit tree clippings'],
        feeding_guide: {
            meat: 'Feed for growth, they are slow growers but have high meat-to-bone ratio.',
            pet: 'Watch weight, they are less active than other breeds.'
        }
    },
    {
        id: 'savanna',
        name: 'Savanna',
        origin: 'South Africa',
        category: 'Meat',
        image: 'https://afs.okstate.edu/breeds/goats/savanna/images/savanna_1.jpg/image_view_fullscreen',
        description: 'The Savanna is a white, meat-type goat developed from indigenous goats of South Africa. They are sometimes called "White Boers" but are a distinct breed known for extreme hardiness and drought tolerance.',
        stats: {
            weight_male: '90 - 110 kg',
            weight_female: '50 - 70 kg',
            height: 'Moderate',
            lifespan: '10 - 12 years'
        },
        traits: {
            skin_pigment: 'Black (UV protection)',
            coat: 'White',
            hardiness: 'Drought Resistant',
            mothering: 'Excellent'
        },
        nutrition: {
            protein_requirement: '14-16%',
            feed_type: 'Veldt / Rangeland browse',
            water_intake: 'Low'
        },
        living_conditions: 'Ideally suited for hot, dry, harsh environments. Strong mothering instincts in open range.',
        favorite_foods: ['Dry shrubs', 'Acacia pods', 'Coarse grass', 'Mineral licks'],
        feeding_guide: {
            maintenance: 'Very efficient feed converters. Thrive on low quality roughage.',
            breeding: 'Excellent fertility rates even in poor seasons.'
        }
    },
    {
        id: 'oberhasli',
        name: 'Oberhasli',
        origin: 'Switzerland',
        category: 'Dairy',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Oberhasli_goat.jpg/1200px-Oberhasli_goat.jpg',
        description: 'A Swiss dairy goat known for its unique "Chamois" color (bay to deep red bay with black dorsal stripe). They are gentle and quiet.',
        stats: {
            weight_male: '68 - 85 kg',
            weight_female: '55 - 65 kg',
            height: '71 cm (min)',
            lifespan: '10 - 15 years'
        },
        traits: {
            color: 'Chamois',
            temperament: 'Quiet',
            pack_ability: 'High',
            milk_production: 'Moderate'
        },
        nutrition: {
            protein_requirement: '16%',
            feed_type: 'Select browse and hay',
            water_intake: 'Moderate'
        },
        living_conditions: 'Often used as pack goats due to strength and temperament. Good for small farms.',
        favorite_foods: ['Fir boughs', 'Oat hay', 'Berries', 'Herbal ley'],
        feeding_guide: {
            lactation: 'Feed according to production.',
            hydration: 'Ensure clean water as they are finicky drinkers.'
        }
    },
    {
        id: 'kalahari_red',
        name: 'Kalahari Red',
        origin: 'South Africa',
        category: 'Meat',
        image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Kalahari_Red_Goat.jpg/1200px-Kalahari_Red_Goat.jpg',
        description: 'Developed in South Africa, the Kalahari Red is a meat goat breed. Their red coat provides camouflage from predators and protection from the sun.',
        stats: {
            weight_male: '115 kg (max)',
            weight_female: '75 kg (max)',
            height: 'Moderate',
            lifespan: '10 - 12 years'
        },
        traits: {
            coat: 'Red / Brown',
            sun_tolerance: 'High',
            mothering: 'Protective',
            foraging: 'Excellent'
        },
        nutrition: {
            protein_requirement: '15%',
            feed_type: 'Range browse',
            water_intake: 'efficient'
        },
        living_conditions: 'Hot, semi-arid regions. Their color helps them hide in the bush.',
        favorite_foods: ['Thorn bush', 'Dry grass', 'Melons', 'Seeds'],
        feeding_guide: {
            growth: 'Similar to Boer but hardier. Less supplementation needed.',
            foraging: 'Will travel long distances for food.'
        }
    }
];
