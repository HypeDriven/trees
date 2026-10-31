import {REGIONAL_REPRODUCTION} from './regional-reproduction.mjs?v=25';
// Regional woody-plant collection. Dimensions are representative modelling values.
// Taxonomy and distribution references: Kew Plants of the World Online.
export const REGIONS = [
  {
    "id": 1,
    "name": "Western Europe",
    "scope": "West Germany, the Low Countries, Denmark, northern France",
    "species": [
      {
        "id": "fagus-sylvatica",
        "name": "European beech",
        "latin": "Fagus sylvatica",
        "family": "Fagaceae",
        "height": 25.0,
        "length": 0.08,
        "width": 0.32,
        "flags": []
      },
      {
        "id": "carpinus-betulus",
        "name": "European hornbeam",
        "latin": "Carpinus betulus",
        "family": "Betulaceae",
        "height": 18.0,
        "length": 0.08,
        "width": 0.3,
        "flags": []
      },
      {
        "id": "tilia-cordata",
        "name": "Small-leaved lime",
        "latin": "Tilia cordata",
        "family": "Malvaceae",
        "height": 22.0,
        "length": 0.07,
        "width": 0.48,
        "flags": []
      },
      {
        "id": "alnus-glutinosa",
        "name": "Black alder",
        "latin": "Alnus glutinosa",
        "family": "Betulaceae",
        "height": 20.0,
        "length": 0.08,
        "width": 0.42,
        "flags": []
      },
      {
        "id": "ulmus-minor",
        "name": "Field elm",
        "latin": "Ulmus minor",
        "family": "Ulmaceae",
        "height": 22.0,
        "length": 0.07,
        "width": 0.3,
        "flags": []
      }
    ]
  },
  {
    "id": 2,
    "name": "Britain",
    "scope": "Britain",
    "species": [
      {
        "id": "quercus-petraea",
        "name": "Sessile oak",
        "latin": "Quercus petraea",
        "family": "Fagaceae",
        "height": 24.0,
        "length": 0.1,
        "width": 0.35,
        "flags": [
          "oak"
        ]
      },
      {
        "id": "corylus-avellana",
        "name": "Common hazel",
        "latin": "Corylus avellana",
        "family": "Betulaceae",
        "height": 5.0,
        "length": 0.09,
        "width": 0.46,
        "flags": []
      },
      {
        "id": "crataegus-monogyna",
        "name": "Common hawthorn",
        "latin": "Crataegus monogyna",
        "family": "Rosaceae",
        "height": 6.0,
        "length": 0.04,
        "width": 0.38,
        "flags": [
          "oak"
        ]
      },
      {
        "id": "ilex-aquifolium",
        "name": "Holly",
        "latin": "Ilex aquifolium",
        "family": "Aquifoliaceae",
        "height": 8.0,
        "length": 0.07,
        "width": 0.28,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "salix-caprea",
        "name": "Goat willow",
        "latin": "Salix caprea",
        "family": "Salicaceae",
        "height": 8.0,
        "length": 0.08,
        "width": 0.34,
        "flags": []
      }
    ]
  },
  {
    "id": 3,
    "name": "Eastern Europe",
    "scope": "East Germany, Poland, Czechoslovakia, Hungary",
    "species": [
      {
        "id": "quercus-cerris",
        "name": "Turkey oak",
        "latin": "Quercus cerris",
        "family": "Fagaceae",
        "height": 22.0,
        "length": 0.1,
        "width": 0.32,
        "flags": [
          "oak"
        ]
      },
      {
        "id": "ulmus-laevis",
        "name": "European white elm",
        "latin": "Ulmus laevis",
        "family": "Ulmaceae",
        "height": 23.0,
        "length": 0.09,
        "width": 0.33,
        "flags": []
      },
      {
        "id": "tilia-platyphyllos",
        "name": "Large-leaved lime",
        "latin": "Tilia platyphyllos",
        "family": "Malvaceae",
        "height": 25.0,
        "length": 0.11,
        "width": 0.48,
        "flags": []
      },
      {
        "id": "populus-tremula",
        "name": "European aspen",
        "latin": "Populus tremula",
        "family": "Salicaceae",
        "height": 20.0,
        "length": 0.06,
        "width": 0.48,
        "flags": []
      },
      {
        "id": "sorbus-torminalis",
        "name": "Wild service tree",
        "latin": "Sorbus torminalis",
        "family": "Rosaceae",
        "height": 16.0,
        "length": 0.09,
        "width": 0.4,
        "flags": [
          "oak"
        ]
      }
    ]
  },
  {
    "id": 4,
    "name": "Nordic countries",
    "scope": "Norway, Sweden, Finland, Iceland",
    "species": [
      {
        "id": "betula-pubescens",
        "name": "Downy birch",
        "latin": "Betula pubescens",
        "family": "Betulaceae",
        "height": 12.0,
        "length": 0.045,
        "width": 0.35,
        "flags": []
      },
      {
        "id": "alnus-incana",
        "name": "Grey alder",
        "latin": "Alnus incana",
        "family": "Betulaceae",
        "height": 14.0,
        "length": 0.07,
        "width": 0.35,
        "flags": []
      },
      {
        "id": "sorbus-aucuparia",
        "name": "Rowan",
        "latin": "Sorbus aucuparia",
        "family": "Rosaceae",
        "height": 10.0,
        "length": 0.045,
        "width": 0.23,
        "flags": [
          "pinnate"
        ]
      },
      {
        "id": "betula-nana",
        "name": "Dwarf birch",
        "latin": "Betula nana",
        "family": "Betulaceae",
        "height": 0.6,
        "length": 0.015,
        "width": 0.48,
        "flags": []
      },
      {
        "id": "salix-phylicifolia",
        "name": "Tea-leaved willow",
        "latin": "Salix phylicifolia",
        "family": "Salicaceae",
        "height": 3.0,
        "length": 0.05,
        "width": 0.28,
        "flags": []
      }
    ]
  },
  {
    "id": 5,
    "name": "The Alps",
    "scope": "The Alps",
    "species": [
      {
        "id": "alnus-alnobetula",
        "name": "Green alder",
        "latin": "Alnus alnobetula",
        "family": "Betulaceae",
        "height": 3.0,
        "length": 0.06,
        "width": 0.35,
        "flags": []
      },
      {
        "id": "sorbus-aria",
        "name": "Whitebeam",
        "latin": "Sorbus aria",
        "family": "Rosaceae",
        "height": 10.0,
        "length": 0.09,
        "width": 0.34,
        "flags": []
      },
      {
        "id": "laburnum-alpinum",
        "name": "Alpine laburnum",
        "latin": "Laburnum alpinum",
        "family": "Fabaceae",
        "height": 6.0,
        "length": 0.06,
        "width": 0.25,
        "flags": [
          "trifoliate"
        ]
      },
      {
        "id": "rhamnus-alpina",
        "name": "Alpine buckthorn",
        "latin": "Rhamnus alpina",
        "family": "Rhamnaceae",
        "height": 3.0,
        "length": 0.08,
        "width": 0.33,
        "flags": []
      },
      {
        "id": "salix-alpina",
        "name": "Alpine willow",
        "latin": "Salix alpina",
        "family": "Salicaceae",
        "height": 0.3,
        "length": 0.025,
        "width": 0.28,
        "flags": []
      }
    ]
  },
  {
    "id": 6,
    "name": "Mediterranean Europe",
    "scope": "Italy, Greece, Spain, Portugal and the islands",
    "species": [
      {
        "id": "quercus-ilex",
        "name": "Holm oak",
        "latin": "Quercus ilex",
        "family": "Fagaceae",
        "height": 14.0,
        "length": 0.06,
        "width": 0.24,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "quercus-suber",
        "name": "Cork oak",
        "latin": "Quercus suber",
        "family": "Fagaceae",
        "height": 14.0,
        "length": 0.05,
        "width": 0.28,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "arbutus-unedo",
        "name": "Strawberry tree",
        "latin": "Arbutus unedo",
        "family": "Ericaceae",
        "height": 6.0,
        "length": 0.08,
        "width": 0.26,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "ceratonia-siliqua",
        "name": "Carob",
        "latin": "Ceratonia siliqua",
        "family": "Fabaceae",
        "height": 9.0,
        "length": 0.045,
        "width": 0.34,
        "flags": [
          "pinnate",
          "evergreen"
        ]
      },
      {
        "id": "laurus-nobilis",
        "name": "Bay laurel",
        "latin": "Laurus nobilis",
        "family": "Lauraceae",
        "height": 8.0,
        "length": 0.09,
        "width": 0.25,
        "flags": [
          "evergreen"
        ]
      }
    ]
  },
  {
    "id": 7,
    "name": "The Balkans and Turkey",
    "scope": "The Balkans and Turkey",
    "species": [
      {
        "id": "fagus-orientalis",
        "name": "Oriental beech",
        "latin": "Fagus orientalis",
        "family": "Fagaceae",
        "height": 25.0,
        "length": 0.1,
        "width": 0.32,
        "flags": []
      },
      {
        "id": "platanus-orientalis",
        "name": "Oriental plane",
        "latin": "Platanus orientalis",
        "family": "Platanaceae",
        "height": 25.0,
        "length": 0.15,
        "width": 0.55,
        "flags": [
          "oak"
        ]
      },
      {
        "id": "quercus-trojana",
        "name": "Macedonian oak",
        "latin": "Quercus trojana",
        "family": "Fagaceae",
        "height": 12.0,
        "length": 0.07,
        "width": 0.24,
        "flags": []
      },
      {
        "id": "carpinus-orientalis",
        "name": "Oriental hornbeam",
        "latin": "Carpinus orientalis",
        "family": "Betulaceae",
        "height": 7.0,
        "length": 0.045,
        "width": 0.28,
        "flags": []
      },
      {
        "id": "corylus-colurna",
        "name": "Turkish hazel",
        "latin": "Corylus colurna",
        "family": "Betulaceae",
        "height": 18.0,
        "length": 0.1,
        "width": 0.44,
        "flags": []
      }
    ]
  },
  {
    "id": 8,
    "name": "The Soviet Union",
    "scope": "Historical geographic grouping",
    "species": [
      {
        "id": "ulmus-pumila",
        "name": "Siberian elm",
        "latin": "Ulmus pumila",
        "family": "Ulmaceae",
        "height": 14.0,
        "length": 0.05,
        "width": 0.28,
        "flags": []
      },
      {
        "id": "phellodendron-amurense",
        "name": "Amur cork tree",
        "latin": "Phellodendron amurense",
        "family": "Rutaceae",
        "height": 16.0,
        "length": 0.08,
        "width": 0.25,
        "flags": [
          "pinnate",
          "opposite"
        ]
      },
      {
        "id": "juglans-mandshurica",
        "name": "Manchurian walnut",
        "latin": "Juglans mandshurica",
        "family": "Juglandaceae",
        "height": 20.0,
        "length": 0.13,
        "width": 0.27,
        "flags": [
          "pinnate"
        ]
      },
      {
        "id": "salix-arbutifolia",
        "name": "Chosenia",
        "latin": "Salix arbutifolia",
        "family": "Salicaceae",
        "height": 20.0,
        "length": 0.08,
        "width": 0.15,
        "flags": []
      },
      {
        "id": "populus-suaveolens",
        "name": "Fragrant poplar",
        "latin": "Populus suaveolens",
        "family": "Salicaceae",
        "height": 20.0,
        "length": 0.09,
        "width": 0.3,
        "flags": []
      }
    ]
  },
  {
    "id": 9,
    "name": "Arctic islands and coasts",
    "scope": "Dwarf woody tundra plants",
    "species": [
      {
        "id": "salix-polaris",
        "name": "Polar willow",
        "latin": "Salix polaris",
        "family": "Salicaceae",
        "height": 0.05,
        "length": 0.015,
        "width": 0.4,
        "flags": []
      },
      {
        "id": "salix-arctica",
        "name": "Arctic willow",
        "latin": "Salix arctica",
        "family": "Salicaceae",
        "height": 0.15,
        "length": 0.03,
        "width": 0.34,
        "flags": []
      },
      {
        "id": "salix-herbacea",
        "name": "Dwarf willow",
        "latin": "Salix herbacea",
        "family": "Salicaceae",
        "height": 0.05,
        "length": 0.015,
        "width": 0.48,
        "flags": []
      },
      {
        "id": "salix-reticulata",
        "name": "Net-leaved willow",
        "latin": "Salix reticulata",
        "family": "Salicaceae",
        "height": 0.15,
        "length": 0.03,
        "width": 0.4,
        "flags": []
      },
      {
        "id": "dryas-integrifolia",
        "name": "Entire-leaved mountain avens",
        "latin": "Dryas integrifolia",
        "family": "Rosaceae",
        "height": 0.12,
        "length": 0.015,
        "width": 0.22,
        "flags": [
          "evergreen"
        ]
      }
    ]
  },
  {
    "id": 10,
    "name": "The Levant",
    "scope": "Lebanon, Syria, Israel, Jordan",
    "species": [
      {
        "id": "quercus-calliprinos",
        "name": "Palestine oak",
        "latin": "Quercus calliprinos",
        "family": "Fagaceae",
        "height": 7.0,
        "length": 0.045,
        "width": 0.27,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "pistacia-palaestina",
        "name": "Palestine pistachio",
        "latin": "Pistacia palaestina",
        "family": "Anacardiaceae",
        "height": 6.0,
        "length": 0.05,
        "width": 0.24,
        "flags": [
          "pinnate"
        ]
      },
      {
        "id": "pyrus-syriaca",
        "name": "Syrian pear",
        "latin": "Pyrus syriaca",
        "family": "Rosaceae",
        "height": 7.0,
        "length": 0.06,
        "width": 0.25,
        "flags": []
      },
      {
        "id": "arbutus-andrachne",
        "name": "Eastern strawberry tree",
        "latin": "Arbutus andrachne",
        "family": "Ericaceae",
        "height": 7.0,
        "length": 0.08,
        "width": 0.28,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "styrax-officinalis",
        "name": "Storax",
        "latin": "Styrax officinalis",
        "family": "Styracaceae",
        "height": 4.0,
        "length": 0.07,
        "width": 0.35,
        "flags": []
      }
    ]
  },
  {
    "id": 11,
    "name": "The Gulf",
    "scope": "Iraq, lowland Iran, Arabia",
    "species": [
      {
        "id": "prosopis-cineraria",
        "name": "Ghaf",
        "latin": "Prosopis cineraria",
        "family": "Fabaceae",
        "height": 8.0,
        "length": 0.01,
        "width": 0.19,
        "flags": [
          "bipinnate",
          "evergreen"
        ]
      },
      {
        "id": "ziziphus-spina-christi",
        "name": "Christ thorn jujube",
        "latin": "Ziziphus spina-christi",
        "family": "Rhamnaceae",
        "height": 9.0,
        "length": 0.05,
        "width": 0.3,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "salvadora-persica",
        "name": "Toothbrush tree",
        "latin": "Salvadora persica",
        "family": "Salvadoraceae",
        "height": 4.0,
        "length": 0.05,
        "width": 0.3,
        "flags": [
          "evergreen",
          "opposite"
        ]
      },
      {
        "id": "avicennia-marina",
        "name": "Grey mangrove",
        "latin": "Avicennia marina",
        "family": "Acanthaceae",
        "height": 6.0,
        "length": 0.07,
        "width": 0.28,
        "flags": [
          "evergreen",
          "opposite"
        ]
      },
      {
        "id": "populus-euphratica",
        "name": "Euphrates poplar",
        "latin": "Populus euphratica",
        "family": "Salicaceae",
        "height": 15.0,
        "length": 0.06,
        "width": 0.35,
        "flags": []
      }
    ]
  },
  {
    "id": 12,
    "name": "Mountainous Asia",
    "scope": "Afghanistan, Kurdistan, Zagros, Caucasus, Pamirs",
    "species": [
      {
        "id": "quercus-brantii",
        "name": "Persian oak",
        "latin": "Quercus brantii",
        "family": "Fagaceae",
        "height": 12.0,
        "length": 0.08,
        "width": 0.3,
        "flags": []
      },
      {
        "id": "parrotia-persica",
        "name": "Persian ironwood",
        "latin": "Parrotia persica",
        "family": "Hamamelidaceae",
        "height": 12.0,
        "length": 0.08,
        "width": 0.34,
        "flags": []
      },
      {
        "id": "zelkova-carpinifolia",
        "name": "Caucasian zelkova",
        "latin": "Zelkova carpinifolia",
        "family": "Ulmaceae",
        "height": 22.0,
        "length": 0.07,
        "width": 0.27,
        "flags": []
      },
      {
        "id": "juglans-regia",
        "name": "Persian walnut",
        "latin": "Juglans regia",
        "family": "Juglandaceae",
        "height": 18.0,
        "length": 0.12,
        "width": 0.29,
        "flags": [
          "pinnate"
        ]
      },
      {
        "id": "betula-utilis",
        "name": "Himalayan birch",
        "latin": "Betula utilis",
        "family": "Betulaceae",
        "height": 14.0,
        "length": 0.07,
        "width": 0.29,
        "flags": []
      }
    ]
  },
  {
    "id": 13,
    "name": "North Africa",
    "scope": "Egypt, Libya, the Maghreb",
    "species": [
      {
        "id": "pistacia-atlantica",
        "name": "Atlas pistachio",
        "latin": "Pistacia atlantica",
        "family": "Anacardiaceae",
        "height": 12.0,
        "length": 0.05,
        "width": 0.25,
        "flags": [
          "pinnate"
        ]
      },
      {
        "id": "sideroxylon-spinosum",
        "name": "Argan",
        "latin": "Sideroxylon spinosum",
        "family": "Sapotaceae",
        "height": 7.0,
        "length": 0.035,
        "width": 0.25,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "balanites-aegyptiaca",
        "name": "Desert date",
        "latin": "Balanites aegyptiaca",
        "family": "Zygophyllaceae",
        "height": 7.0,
        "length": 0.04,
        "width": 0.28,
        "flags": [
          "bifoliate"
        ]
      },
      {
        "id": "myrtus-nivellei",
        "name": "Saharan myrtle",
        "latin": "Myrtus nivellei",
        "family": "Myrtaceae",
        "height": 2.0,
        "length": 0.025,
        "width": 0.22,
        "flags": [
          "evergreen",
          "opposite"
        ]
      },
      {
        "id": "tamarix-africana",
        "name": "African tamarisk",
        "latin": "Tamarix africana",
        "family": "Tamaricaceae",
        "height": 5.0,
        "length": 0.003,
        "width": 0.14,
        "flags": [
          "scale"
        ]
      }
    ]
  },
  {
    "id": 14,
    "name": "The Sahel and Sahara’s edge",
    "scope": "The Sahel and Sahara’s edge",
    "species": [
      {
        "id": "faidherbia-albida",
        "name": "Apple-ring acacia",
        "latin": "Faidherbia albida",
        "family": "Fabaceae",
        "height": 15.0,
        "length": 0.008,
        "width": 0.2,
        "flags": [
          "bipinnate"
        ]
      },
      {
        "id": "vachellia-tortilis",
        "name": "Umbrella thorn",
        "latin": "Vachellia tortilis",
        "family": "Fabaceae",
        "height": 9.0,
        "length": 0.005,
        "width": 0.2,
        "flags": [
          "bipinnate"
        ]
      },
      {
        "id": "senegalia-senegal",
        "name": "Gum arabic tree",
        "latin": "Senegalia senegal",
        "family": "Fabaceae",
        "height": 6.0,
        "length": 0.005,
        "width": 0.22,
        "flags": [
          "bipinnate"
        ]
      },
      {
        "id": "combretum-glutinosum",
        "name": "Red bushwillow",
        "latin": "Combretum glutinosum",
        "family": "Combretaceae",
        "height": 8.0,
        "length": 0.12,
        "width": 0.32,
        "flags": []
      },
      {
        "id": "anogeissus-leiocarpa",
        "name": "African birch",
        "latin": "Anogeissus leiocarpa",
        "family": "Combretaceae",
        "height": 16.0,
        "length": 0.06,
        "width": 0.25,
        "flags": []
      }
    ]
  },
  {
    "id": 15,
    "name": "The Horn of Africa and East Africa",
    "scope": "The Horn of Africa and East Africa",
    "species": [
      {
        "id": "ficus-sycomorus",
        "name": "Sycamore fig",
        "latin": "Ficus sycomorus",
        "family": "Moraceae",
        "height": 18.0,
        "length": 0.15,
        "width": 0.4,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "kiggelaria-africana",
        "name": "African wild peach",
        "latin": "Kiggelaria africana",
        "family": "Achariaceae",
        "height": 12.0,
        "length": 0.08,
        "width": 0.28,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "prunus-africana",
        "name": "African cherry",
        "latin": "Prunus africana",
        "family": "Rosaceae",
        "height": 20.0,
        "length": 0.1,
        "width": 0.26,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "cordia-africana",
        "name": "African cordia",
        "latin": "Cordia africana",
        "family": "Boraginaceae",
        "height": 14.0,
        "length": 0.15,
        "width": 0.42,
        "flags": []
      },
      {
        "id": "warburgia-ugandensis",
        "name": "East African greenheart",
        "latin": "Warburgia ugandensis",
        "family": "Canellaceae",
        "height": 15.0,
        "length": 0.09,
        "width": 0.23,
        "flags": [
          "evergreen"
        ]
      }
    ]
  },
  {
    "id": 16,
    "name": "Tropical Africa",
    "scope": "Congo, West Africa, Niger Delta",
    "species": [
      {
        "id": "milicia-excelsa",
        "name": "Iroko",
        "latin": "Milicia excelsa",
        "family": "Moraceae",
        "height": 28.0,
        "length": 0.15,
        "width": 0.3,
        "flags": []
      },
      {
        "id": "pericopsis-elata",
        "name": "African teak",
        "latin": "Pericopsis elata",
        "family": "Fabaceae",
        "height": 28.0,
        "length": 0.06,
        "width": 0.27,
        "flags": [
          "pinnate"
        ]
      },
      {
        "id": "pentaclethra-macrophylla",
        "name": "African oil bean",
        "latin": "Pentaclethra macrophylla",
        "family": "Fabaceae",
        "height": 20.0,
        "length": 0.02,
        "width": 0.23,
        "flags": [
          "bipinnate"
        ]
      },
      {
        "id": "pycnanthus-angolensis",
        "name": "African nutmeg",
        "latin": "Pycnanthus angolensis",
        "family": "Myristicaceae",
        "height": 24.0,
        "length": 0.2,
        "width": 0.24,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "rhizophora-racemosa",
        "name": "Red mangrove of Africa",
        "latin": "Rhizophora racemosa",
        "family": "Rhizophoraceae",
        "height": 18.0,
        "length": 0.14,
        "width": 0.28,
        "flags": [
          "evergreen",
          "opposite"
        ]
      }
    ]
  },
  {
    "id": 17,
    "name": "Southern Africa",
    "scope": "Angola, Namibia, Zambia, South Africa",
    "species": [
      {
        "id": "colophospermum-mopane",
        "name": "Mopane",
        "latin": "Colophospermum mopane",
        "family": "Fabaceae",
        "height": 10.0,
        "length": 0.07,
        "width": 0.36,
        "flags": [
          "bifoliate"
        ]
      },
      {
        "id": "diospyros-mespiliformis",
        "name": "African ebony",
        "latin": "Diospyros mespiliformis",
        "family": "Ebenaceae",
        "height": 16.0,
        "length": 0.09,
        "width": 0.26,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "trichilia-emetica",
        "name": "Natal mahogany",
        "latin": "Trichilia emetica",
        "family": "Meliaceae",
        "height": 16.0,
        "length": 0.1,
        "width": 0.29,
        "flags": [
          "pinnate",
          "evergreen"
        ]
      },
      {
        "id": "syzygium-cordatum",
        "name": "Waterberry",
        "latin": "Syzygium cordatum",
        "family": "Myrtaceae",
        "height": 10.0,
        "length": 0.09,
        "width": 0.34,
        "flags": [
          "evergreen",
          "opposite"
        ]
      },
      {
        "id": "vachellia-erioloba",
        "name": "Camel thorn",
        "latin": "Vachellia erioloba",
        "family": "Fabaceae",
        "height": 10.0,
        "length": 0.008,
        "width": 0.2,
        "flags": [
          "bipinnate"
        ]
      }
    ]
  },
  {
    "id": 18,
    "name": "South Asia",
    "scope": "India, Pakistan’s plains, Bangladesh, Andaman Islands",
    "species": [
      {
        "id": "ficus-benghalensis",
        "name": "Banyan",
        "latin": "Ficus benghalensis",
        "family": "Moraceae",
        "height": 18.0,
        "length": 0.18,
        "width": 0.35,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "ficus-religiosa",
        "name": "Sacred fig",
        "latin": "Ficus religiosa",
        "family": "Moraceae",
        "height": 18.0,
        "length": 0.14,
        "width": 0.4,
        "flags": []
      },
      {
        "id": "azadirachta-indica",
        "name": "Neem",
        "latin": "Azadirachta indica",
        "family": "Meliaceae",
        "height": 14.0,
        "length": 0.06,
        "width": 0.22,
        "flags": [
          "pinnate",
          "evergreen"
        ]
      },
      {
        "id": "shorea-robusta",
        "name": "Sal",
        "latin": "Shorea robusta",
        "family": "Dipterocarpaceae",
        "height": 25.0,
        "length": 0.18,
        "width": 0.3,
        "flags": []
      },
      {
        "id": "terminalia-catappa",
        "name": "Indian almond",
        "latin": "Terminalia catappa",
        "family": "Combretaceae",
        "height": 16.0,
        "length": 0.22,
        "width": 0.35,
        "flags": []
      }
    ]
  },
  {
    "id": 19,
    "name": "Korea",
    "scope": "Korea",
    "species": [
      {
        "id": "quercus-mongolica",
        "name": "Mongolian oak",
        "latin": "Quercus mongolica",
        "family": "Fagaceae",
        "height": 18.0,
        "length": 0.12,
        "width": 0.35,
        "flags": [
          "oak"
        ]
      },
      {
        "id": "carpinus-turczaninovii",
        "name": "Korean hornbeam",
        "latin": "Carpinus turczaninovii",
        "family": "Betulaceae",
        "height": 8.0,
        "length": 0.045,
        "width": 0.3,
        "flags": []
      },
      {
        "id": "sorbus-alnifolia",
        "name": "Korean mountain ash",
        "latin": "Sorbus alnifolia",
        "family": "Rosaceae",
        "height": 12.0,
        "length": 0.07,
        "width": 0.33,
        "flags": []
      },
      {
        "id": "maackia-amurensis",
        "name": "Amur maackia",
        "latin": "Maackia amurensis",
        "family": "Fabaceae",
        "height": 10.0,
        "length": 0.06,
        "width": 0.27,
        "flags": [
          "pinnate"
        ]
      },
      {
        "id": "stewartia-pseudocamellia",
        "name": "Korean stewartia",
        "latin": "Stewartia pseudocamellia",
        "family": "Theaceae",
        "height": 10.0,
        "length": 0.07,
        "width": 0.28,
        "flags": []
      }
    ]
  },
  {
    "id": 20,
    "name": "China and Taiwan",
    "scope": "China and Taiwan",
    "species": [
      {
        "id": "celtis-sinensis",
        "name": "Chinese hackberry",
        "latin": "Celtis sinensis",
        "family": "Cannabaceae",
        "height": 18.0,
        "length": 0.08,
        "width": 0.29,
        "flags": []
      },
      {
        "id": "cinnamomum-camphora",
        "name": "Camphor tree",
        "latin": "Cinnamomum camphora",
        "family": "Lauraceae",
        "height": 20.0,
        "length": 0.09,
        "width": 0.28,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "prunus-campanulata",
        "name": "Taiwan cherry",
        "latin": "Prunus campanulata",
        "family": "Rosaceae",
        "height": 7.0,
        "length": 0.08,
        "width": 0.27,
        "flags": []
      },
      {
        "id": "toona-sinensis",
        "name": "Chinese toon",
        "latin": "Toona sinensis",
        "family": "Meliaceae",
        "height": 18.0,
        "length": 0.1,
        "width": 0.25,
        "flags": [
          "pinnate"
        ]
      },
      {
        "id": "triadica-sebifera",
        "name": "Chinese tallow",
        "latin": "Triadica sebifera",
        "family": "Euphorbiaceae",
        "height": 12.0,
        "length": 0.06,
        "width": 0.45,
        "flags": []
      }
    ]
  },
  {
    "id": 21,
    "name": "Japan",
    "scope": "Japan",
    "species": [
      {
        "id": "fagus-crenata",
        "name": "Japanese beech",
        "latin": "Fagus crenata",
        "family": "Fagaceae",
        "height": 22.0,
        "length": 0.08,
        "width": 0.3,
        "flags": []
      },
      {
        "id": "zelkova-serrata",
        "name": "Japanese zelkova",
        "latin": "Zelkova serrata",
        "family": "Ulmaceae",
        "height": 20.0,
        "length": 0.07,
        "width": 0.27,
        "flags": []
      },
      {
        "id": "cercidiphyllum-japonicum",
        "name": "Katsura",
        "latin": "Cercidiphyllum japonicum",
        "family": "Cercidiphyllaceae",
        "height": 18.0,
        "length": 0.07,
        "width": 0.45,
        "flags": [
          "opposite"
        ]
      },
      {
        "id": "styrax-japonicus",
        "name": "Japanese snowbell",
        "latin": "Styrax japonicus",
        "family": "Styracaceae",
        "height": 8.0,
        "length": 0.06,
        "width": 0.3,
        "flags": []
      },
      {
        "id": "aesculus-turbinata",
        "name": "Japanese horse chestnut",
        "latin": "Aesculus turbinata",
        "family": "Sapindaceae",
        "height": 20.0,
        "length": 0.18,
        "width": 0.27,
        "flags": [
          "palmate",
          "opposite"
        ]
      }
    ]
  },
  {
    "id": 22,
    "name": "Mainland Southeast Asia",
    "scope": "Vietnam, Cambodia, Laos, Thailand, Burma",
    "species": [
      {
        "id": "tectona-grandis",
        "name": "Teak",
        "latin": "Tectona grandis",
        "family": "Lamiaceae",
        "height": 24.0,
        "length": 0.35,
        "width": 0.33,
        "flags": [
          "opposite"
        ]
      },
      {
        "id": "pterocarpus-macrocarpus",
        "name": "Burmese rosewood",
        "latin": "Pterocarpus macrocarpus",
        "family": "Fabaceae",
        "height": 20.0,
        "length": 0.08,
        "width": 0.27,
        "flags": [
          "pinnate"
        ]
      },
      {
        "id": "dalbergia-cochinchinensis",
        "name": "Siamese rosewood",
        "latin": "Dalbergia cochinchinensis",
        "family": "Fabaceae",
        "height": 18.0,
        "length": 0.05,
        "width": 0.29,
        "flags": [
          "pinnate"
        ]
      },
      {
        "id": "cassia-fistula",
        "name": "Golden shower tree",
        "latin": "Cassia fistula",
        "family": "Fabaceae",
        "height": 10.0,
        "length": 0.12,
        "width": 0.29,
        "flags": [
          "pinnate"
        ]
      },
      {
        "id": "shorea-obtusa",
        "name": "Burmese sal",
        "latin": "Shorea obtusa",
        "family": "Dipterocarpaceae",
        "height": 18.0,
        "length": 0.12,
        "width": 0.36,
        "flags": []
      }
    ]
  },
  {
    "id": 23,
    "name": "Maritime Southeast Asia and the Pacific",
    "scope": "Maritime Southeast Asia and the Pacific",
    "species": [
      {
        "id": "artocarpus-altilis",
        "name": "Breadfruit",
        "latin": "Artocarpus altilis",
        "family": "Moraceae",
        "height": 14.0,
        "length": 0.4,
        "width": 0.4,
        "flags": [
          "oak",
          "evergreen"
        ]
      },
      {
        "id": "talipariti-tiliaceum",
        "name": "Sea hibiscus",
        "latin": "Talipariti tiliaceum",
        "family": "Malvaceae",
        "height": 7.0,
        "length": 0.14,
        "width": 0.46,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "thespesia-populnea",
        "name": "Pacific rosewood",
        "latin": "Thespesia populnea",
        "family": "Malvaceae",
        "height": 8.0,
        "length": 0.12,
        "width": 0.44,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "calophyllum-inophyllum",
        "name": "Alexandrian laurel",
        "latin": "Calophyllum inophyllum",
        "family": "Calophyllaceae",
        "height": 14.0,
        "length": 0.14,
        "width": 0.3,
        "flags": [
          "evergreen",
          "opposite"
        ]
      },
      {
        "id": "syzygium-malaccense",
        "name": "Malay apple",
        "latin": "Syzygium malaccense",
        "family": "Myrtaceae",
        "height": 12.0,
        "length": 0.2,
        "width": 0.25,
        "flags": [
          "evergreen",
          "opposite"
        ]
      }
    ]
  },
  {
    "id": 24,
    "name": "Central America, the Caribbean and northern South America",
    "scope": "Central America, the Caribbean and northern South America",
    "species": [
      {
        "id": "ceiba-pentandra",
        "name": "Kapok",
        "latin": "Ceiba pentandra",
        "family": "Malvaceae",
        "height": 30.0,
        "length": 0.12,
        "width": 0.24,
        "flags": [
          "palmate"
        ]
      },
      {
        "id": "swietenia-macrophylla",
        "name": "Big-leaf mahogany",
        "latin": "Swietenia macrophylla",
        "family": "Meliaceae",
        "height": 28.0,
        "length": 0.12,
        "width": 0.28,
        "flags": [
          "pinnate"
        ]
      },
      {
        "id": "guaiacum-officinale",
        "name": "Guaiacum",
        "latin": "Guaiacum officinale",
        "family": "Zygophyllaceae",
        "height": 7.0,
        "length": 0.03,
        "width": 0.35,
        "flags": [
          "pinnate",
          "evergreen",
          "opposite"
        ]
      },
      {
        "id": "bursera-simaruba",
        "name": "Gumbo limbo",
        "latin": "Bursera simaruba",
        "family": "Burseraceae",
        "height": 15.0,
        "length": 0.07,
        "width": 0.3,
        "flags": [
          "pinnate"
        ]
      },
      {
        "id": "terminalia-buceras",
        "name": "West Indian almond",
        "latin": "Terminalia buceras",
        "family": "Combretaceae",
        "height": 16.0,
        "length": 0.07,
        "width": 0.3,
        "flags": [
          "evergreen"
        ]
      }
    ]
  },
  {
    "id": 25,
    "name": "The rest of South America",
    "scope": "Brazil, Argentina, Chile, the Andes",
    "species": [
      {
        "id": "paubrasilia-echinata",
        "name": "Brazilwood",
        "latin": "Paubrasilia echinata",
        "family": "Fabaceae",
        "height": 12.0,
        "length": 0.015,
        "width": 0.25,
        "flags": [
          "bipinnate"
        ]
      },
      {
        "id": "nothofagus-pumilio",
        "name": "Patagonian southern beech",
        "latin": "Nothofagus pumilio",
        "family": "Nothofagaceae",
        "height": 18.0,
        "length": 0.03,
        "width": 0.32,
        "flags": []
      },
      {
        "id": "luma-apiculata",
        "name": "Chilean myrtle",
        "latin": "Luma apiculata",
        "family": "Myrtaceae",
        "height": 8.0,
        "length": 0.025,
        "width": 0.25,
        "flags": [
          "evergreen",
          "opposite"
        ]
      },
      {
        "id": "quillaja-saponaria",
        "name": "Quillay",
        "latin": "Quillaja saponaria",
        "family": "Quillajaceae",
        "height": 12.0,
        "length": 0.04,
        "width": 0.25,
        "flags": [
          "evergreen"
        ]
      },
      {
        "id": "cecropia-pachystachya",
        "name": "Cecropia",
        "latin": "Cecropia pachystachya",
        "family": "Urticaceae",
        "height": 12.0,
        "length": 0.3,
        "width": 0.5,
        "flags": [
          "palmate"
        ]
      }
    ]
  }
];
export const REGIONAL_SPECIES={};
export const REGIONAL_PRESETS={};
for(const region of REGIONS)for(const entry of region.species){
 const {id,name,latin,family,height,length,width,flags}=entry;
 const compound=flags.find(f=>['pinnate','bipinnate','palmate','trifoliate','bifoliate'].includes(f));
 const reproduction=REGIONAL_REPRODUCTION[id];
 const template=height<4?'birch':flags.includes('oak')?'oak':compound==='bipinnate'?'fevertree':compound==='pinnate'?'marula':['Ficus','Platanus','Artocarpus','Terminalia'].includes(reproduction.genus)?'oak':['Styrax','Prunus','Stewartia'].includes(reproduction.genus)?'sakura':'birch';
 const barkClass=['Fagus','Carpinus','Ficus','Ilex','Laurus'].includes(reproduction.genus)?'smooth':['Betula','Prunus','Corylus'].includes(reproduction.genus)?'lenticels':['Arbutus','Luma','Bursera','Platanus','Parrotia'].includes(reproduction.genus)?'flaky':['Tamarix','Ceiba'].includes(reproduction.genus)?'fibrous':'furrowed';
 const bark=barkClass==='smooth'?{pattern:'powdery',depth:.0007,pitch:.012,length:.018}:barkClass==='lenticels'?{pattern:'lenticels',depth:.0015,pitch:.026,length:.014}:barkClass==='flaky'?{pattern:'flaky',depth:.003,pitch:.035,length:.045}:barkClass==='fibrous'?{pattern:'fibrous',depth:.006,pitch:.015,length:.10}:{pattern:'furrowed',depth:reproduction.genus==='Quercus'?.012:.006,pitch:.023,length:.09};
 const source='https://powo.science.kew.org/results?q='+encodeURIComponent(latin);
 REGIONAL_SPECIES[id]={name,latin,family,collection:'regional',reproductiveModel:true,reproduction,bark,outline:flags.includes('oak')?'lobed':'elliptic',region:region.name,regionId:region.id,template,
 leaf:[length*.65,length*1.4],length,width,petiole:[length*.12,length*.28],bud:Math.min(.006,length*.09),veins:8,rows:10,twig:[.30,.23,.15],leafColor:[.16,.30,.09],fall:flags.includes('evergreen')?[.16,.30,.09]:[.63,.39,.08],
 earlyBloom:['Prunus','Parrotia','Corylus'].includes(reproduction.genus),spines:['Vachellia','Senegalia','Prosopis'].includes(reproduction.genus),evergreen:flags.includes('evergreen'),opposite:flags.includes('opposite'),compound:latin==='Cecropia pachystachya'?undefined:compound,leafPairs:compound==='bifoliate'?[1,1]:[4,7],
 fruitStudySpan:Math.max(.16,reproduction.fruitLength*2.5+reproduction.fruitWidth*4),organStudySpan:Math.max(.18,length*2.4),heightRange:[Math.max(.02,height*.35),height*1.7],rootDepthRange:[.02,3],source,
 habit:height<1?'Low dwarf woody habit with short spreading shoots.':height<4?'Low branching shrub with spreading woody shoots.':compound==='bipinnate'?'Open spreading crown with fine divided foliage.':template==='oak'?'Broad spreading crown with heavy irregular scaffold branches.':'Ascending boughs and an uneven rounded crown.',
 traits:[compound?compound+' foliage; leaflet dimensions shown': 'Simple leaves; representative mature blade dimensions',flags.includes('evergreen')?'Evergreen foliage':'Deciduous seasonal preview',reproduction.flowerForm+' flowers; '+reproduction.fruitForm+' reproductive structures'],
 range:`${region.scope}. Representative ${compound?'leaflet':'blade'} length ${Math.round(length*.65*1000)}–${Math.round(length*1.4*1000)} mm.`,
 limitations:'Procedural species profiles with shared anatomical builders. Organ counts, crown architecture, tissue relief and seasonal snapshots are representative, not calibrated scans.'};
 REGIONAL_PRESETS[id]={height,spread:height<1?1.3:1,leafSize:length,density:60,rootDepth:Math.min(1.5,Math.max(.04,height*.12)),season:'summer',reproductive:true};
}
