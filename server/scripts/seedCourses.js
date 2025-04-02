// server/scripts/seedCourses.js
const mongoose = require('mongoose');
const Course = require('../models/Course');
const Question = require('../models/Question');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Initial courses data
const courses = [
  {
    title: 'Physics (A Levels)',
    description: 'This course covers the complete A Level Physics syllabus, focusing on mechanics, electricity, waves, and modern physics. Students will develop a deep understanding of physical principles and their applications.',
    collection: 'A Levels',
    topics: [
      'Mechanics and Motion',
      'Forces and Energy',
      'Waves and Optics',
      'Electricity and Magnetism',
      'Thermal Physics',
      'Nuclear Physics',
      'Quantum Phenomena'
    ],
    image: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80'
  },
  {
    title: 'Pure Mathematics (A Levels)',
    description: 'This course covers the complete A Level Pure Mathematics syllabus, including algebra, calculus, trigonometry, and coordinate geometry. Students will develop strong problem-solving skills and mathematical reasoning.',
    collection: 'A Levels',
    topics: [
      'Algebra and Functions',
      'Coordinate Geometry',
      'Sequences and Series',
      'Trigonometry',
      'Exponentials and Logarithms',
      'Differentiation',
      'Integration',
      'Numerical Methods'
    ],
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  },
  {
    title: 'Physics (IB)',
    description: 'This course covers the complete IB Physics syllabus, including mechanics, thermal physics, waves, electricity, magnetism, and modern physics. Students will develop experimental skills and theoretical knowledge.',
    collection: 'IB',
    topics: [
      'Measurements and Uncertainties',
      'Mechanics',
      'Thermal Physics',
      'Waves',
      'Electricity and Magnetism',
      'Circular Motion and Gravitation',
      'Atomic, Nuclear and Particle Physics',
      'Energy Production'
    ],
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1228&q=80'
  },
  {
    title: 'Mathematics (IB)',
    description: 'This course covers the complete IB Mathematics syllabus, focusing on algebra, functions, trigonometry, vectors, statistics, and calculus. Students will develop problem-solving skills and mathematical thinking.',
    collection: 'IB',
    topics: [
      'Algebra',
      'Functions and Equations',
      'Circular Functions and Trigonometry',
      'Vectors',
      'Statistics and Probability',
      'Calculus',
      'Mathematical Exploration'
    ],
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
  },
  {
    title: 'SAT Preparation',
    description: 'This comprehensive SAT preparation course covers all sections of the test: Reading, Writing & Language, and Mathematics. Students will learn test-taking strategies, practice with real SAT questions, and develop the skills needed to achieve a high score.',
    collection: 'US BSc Preparation',
    topics: [
      'Reading Comprehension',
      'Writing and Language',
      'Heart of Algebra',
      'Problem Solving and Data Analysis',
      'Passport to Advanced Mathematics',
      'Essay Writing (Optional)',
      'Test-Taking Strategies',
      'Time Management'
    ],
    image: 'https://images.unsplash.com/photo-1588075592446-265fd1e6e76f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1172&q=80'
  },
  {
    title: 'IELTS Preparation',
    description: 'This IELTS preparation course covers all four sections of the test: Listening, Reading, Writing, and Speaking. Students will learn test-taking strategies, practice with authentic IELTS materials, and develop the language skills needed to achieve their target band score.',
    collection: 'US BSc Preparation',
    topics: [
      'Listening Skills',
      'Reading Strategies',
      'Writing Task 1 (Academic)',
      'Writing Task 2 (Essay)',
      'Speaking Parts 1-3',
      'Grammar and Vocabulary',
      'Pronunciation',
      'Test-Taking Strategies'
    ],
    image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1171&q=80'
  }
];

// Sample questions for Physics (A Levels)
const physicsALevelQuestions = [
  {
    "text": "Which of the following is the correct unit for momentum?",
    "options": [
      {
        "text": "kg m/s²",
        "explanation": "kg m/s² is the unit for force (Newton), not momentum.",
        "isCorrect": False
      },
      {
        "text": "kg m/s",
        "explanation": "Momentum is mass × velocity, so its unit is kg m/s.",
        "isCorrect": True
      },
      {
        "text": "kg m²/s",
        "explanation": "kg m²/s is the unit for angular momentum, not linear momentum.",
        "isCorrect": False
      },
      {
        "text": "J s",
        "explanation": "J s (joule-second) is the unit for Planck's constant, not momentum.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between wavelength (λ) and frequency (f) of a wave?",
    "options": [
      {
        "text": "λ = f/v",
        "explanation": "This is incorrect. The correct relationship is λ = v/f, where v is the wave speed.",
        "isCorrect": False
      },
      {
        "text": "λ = v × f",
        "explanation": "This is incorrect. The correct relationship is λ = v/f, where v is the wave speed.",
        "isCorrect": False
      },
      {
        "text": "λ = v/f",
        "explanation": "Correct! The wavelength equals the wave speed divided by the frequency.",
        "isCorrect": True
      },
      {
        "text": "λ = f × t",
        "explanation": "This is incorrect. The relationship between wavelength and frequency is λ = v/f.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following statements about gravitational potential energy is correct?",
    "options": [
      {
        "text": "Gravitational potential energy increases as height decreases",
        "explanation": "This is incorrect. Gravitational potential energy increases with height.",
        "isCorrect": False
      },
      {
        "text": "Gravitational potential energy is always positive",
        "explanation": "This is incorrect. Gravitational potential energy can be negative, zero, or positive depending on the reference point.",
        "isCorrect": False
      },
      {
        "text": "Gravitational potential energy increases as height increases",
        "explanation": "Correct! Gravitational potential energy increases with height according to mgh.",
        "isCorrect": True
      },
      {
        "text": "Gravitational potential energy is independent of mass",
        "explanation": "This is incorrect. Gravitational potential energy is directly proportional to mass.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the SI unit of electric field strength?",
    "options": [
      {
        "text": "N/C",
        "explanation": "Correct! Electric field strength is force per unit charge, so its unit is newtons per coulomb (N/C).",
        "isCorrect": True
      },
      {
        "text": "V/m",
        "explanation": "This is also correct, but N/C is the more fundamental unit. V/m is equivalent to N/C.",
        "isCorrect": False
      },
      {
        "text": "N·m/C",
        "explanation": "This is incorrect. N·m/C is the unit for electric potential (voltage), not electric field strength.",
        "isCorrect": False
      },
      {
        "text": "C/m²",
        "explanation": "This is incorrect. C/m² is the unit for electric flux density, not electric field strength.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following is a vector quantity?",
    "options": [
      {
        "text": "Work",
        "explanation": "This is incorrect. Work is a scalar quantity, not a vector.",
        "isCorrect": False
      },
      {
        "text": "Energy",
        "explanation": "This is incorrect. Energy is a scalar quantity, not a vector.",
        "isCorrect": False
      },
      {
        "text": "Acceleration",
        "explanation": "Correct! Acceleration has both magnitude and direction, making it a vector quantity.",
        "isCorrect": True
      },
      {
        "text": "Temperature",
        "explanation": "This is incorrect. Temperature is a scalar quantity, not a vector.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between electric potential (V) and electric field strength (E)?",
    "options": [
      {
        "text": "E = V × d",
        "explanation": "This is incorrect. The relationship is E = -dV/dx, or V = -∫E·dl.",
        "isCorrect": False
      },
      {
        "text": "E = V/d",
        "explanation": "This is correct for a uniform field between parallel plates, where d is the distance between the plates.",
        "isCorrect": True
      },
      {
        "text": "E = V²",
        "explanation": "This is incorrect. The relationship is E = -dV/dx, or V = -∫E·dl.",
        "isCorrect": False
      },
      {
        "text": "E = √V",
        "explanation": "This is incorrect. The relationship is E = -dV/dx, or V = -∫E·dl.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following correctly describes the photoelectric effect?",
    "options": [
      {
        "text": "Electrons are emitted when light of any frequency hits a metal surface",
        "explanation": "This is incorrect. Electrons are only emitted when the frequency of light is above the threshold frequency.",
        "isCorrect": False
      },
      {
        "text": "The kinetic energy of emitted electrons depends only on the intensity of light",
        "explanation": "This is incorrect. The kinetic energy of emitted electrons depends on the frequency of light, not its intensity.",
        "isCorrect": False
      },
      {
        "text": "The number of electrons emitted depends on the frequency of light",
        "explanation": "This is incorrect. The number of electrons emitted depends on the intensity of light, not its frequency.",
        "isCorrect": False
      },
      {
        "text": "Electrons are emitted only when light above a threshold frequency hits a metal surface",
        "explanation": "Correct! This describes the photoelectric effect, where electrons are only emitted when the photon energy (related to frequency) exceeds the work function.",
        "isCorrect": True
      }
    ]
  },
  {
    "text": "What is the de Broglie wavelength of a particle?",
    "options": [
      {
        "text": "λ = h/p",
        "explanation": "Correct! The de Broglie wavelength equals Planck's constant divided by momentum.",
        "isCorrect": True
      },
      {
        "text": "λ = h×p",
        "explanation": "This is incorrect. The de Broglie wavelength is h/p, not h×p.",
        "isCorrect": False
      },
      {
        "text": "λ = p/h",
        "explanation": "This is incorrect. The de Broglie wavelength is h/p, not p/h.",
        "isCorrect": False
      },
      {
        "text": "λ = h/E",
        "explanation": "This is incorrect. The de Broglie wavelength is h/p, not h/E.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following statements about simple harmonic motion is correct?",
    "options": [
      {
        "text": "The acceleration is directly proportional to displacement",
        "explanation": "This is incorrect. In SHM, acceleration is directly proportional to displacement but in the opposite direction.",
        "isCorrect": False
      },
      {
        "text": "The acceleration is directly proportional to displacement and in the opposite direction",
        "explanation": "Correct! In SHM, a = -ω²x, where acceleration is proportional to displacement but in the opposite direction.",
        "isCorrect": True
      },
      {
        "text": "The velocity is directly proportional to displacement",
        "explanation": "This is incorrect. In SHM, velocity is not directly proportional to displacement.",
        "isCorrect": False
      },
      {
        "text": "The period depends on the amplitude",
        "explanation": "This is incorrect. In SHM, the period is independent of amplitude.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the focal length (f) of a lens and its power (P)?",
    "options": [
      {
        "text": "P = f",
        "explanation": "This is incorrect. The power of a lens is the reciprocal of its focal length in meters.",
        "isCorrect": False
      },
      {
        "text": "P = 1/f",
        "explanation": "Correct! The power of a lens in diopters equals 1 divided by the focal length in meters.",
        "isCorrect": True
      },
      {
        "text": "P = f²",
        "explanation": "This is incorrect. The power of a lens is the reciprocal of its focal length in meters.",
        "isCorrect": False
      },
      {
        "text": "P = √f",
        "explanation": "This is incorrect. The power of a lens is the reciprocal of its focal length in meters.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following is the correct expression for the magnetic force on a moving charged particle?",
    "options": [
      {
        "text": "F = qvB",
        "explanation": "This is incomplete. The magnetic force depends on the angle between velocity and magnetic field.",
        "isCorrect": False
      },
      {
        "text": "F = qvB sin θ",
        "explanation": "Correct! The magnetic force is F = qvB sin θ, where θ is the angle between velocity and magnetic field.",
        "isCorrect": True
      },
      {
        "text": "F = qvB cos θ",
        "explanation": "This is incorrect. The magnetic force is F = qvB sin θ, not qvB cos θ.",
        "isCorrect": False
      },
      {
        "text": "F = qB/v",
        "explanation": "This is incorrect. The magnetic force is directly proportional to velocity, not inversely proportional.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the principle of superposition for waves?",
    "options": [
      {
        "text": "When two waves meet, they always cancel each other out",
        "explanation": "This is incorrect. Waves can either constructively or destructively interfere, not always cancel out.",
        "isCorrect": False
      },
      {
        "text": "When two waves meet, they always reinforce each other",
        "explanation": "This is incorrect. Waves can either constructively or destructively interfere, not always reinforce.",
        "isCorrect": False
      },
      {
        "text": "When two waves meet, the resultant displacement equals the sum of the individual displacements",
        "explanation": "Correct! The principle of superposition states that when waves overlap, the resultant displacement equals the vector sum of the individual displacements.",
        "isCorrect": True
      },
      {
        "text": "When two waves meet, they pass through each other unchanged",
        "explanation": "This is partially correct but incomplete. Waves do pass through each other, but the principle of superposition describes what happens during the overlap.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following statements about nuclear fusion is correct?",
    "options": [
      {
        "text": "Nuclear fusion releases energy because the products have less mass than the reactants",
        "explanation": "Correct! In fusion, the mass defect is converted to energy according to E = mc².",
        "isCorrect": True
      },
      {
        "text": "Nuclear fusion releases energy because the products have more mass than the reactants",
        "explanation": "This is incorrect. In fusion, the products have less mass than the reactants, not more.",
        "isCorrect": False
      },
      {
        "text": "Nuclear fusion occurs spontaneously at room temperature",
        "explanation": "This is incorrect. Fusion requires extremely high temperatures to overcome the electrostatic repulsion between nuclei.",
        "isCorrect": False
      },
      {
        "text": "Nuclear fusion involves the splitting of heavy nuclei",
        "explanation": "This is incorrect. Fusion involves the combining of light nuclei, while fission involves the splitting of heavy nuclei.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the rms speed of gas molecules (vrms) and temperature (T)?",
    "options": [
      {
        "text": "vrms ∝ T",
        "explanation": "This is incorrect. The rms speed is proportional to the square root of temperature.",
        "isCorrect": False
      },
      {
        "text": "vrms ∝ √T",
        "explanation": "Correct! According to kinetic theory, vrms = √(3RT/M), so vrms is proportional to √T.",
        "isCorrect": True
      },
      {
        "text": "vrms ∝ T²",
        "explanation": "This is incorrect. The rms speed is proportional to the square root of temperature.",
        "isCorrect": False
      },
      {
        "text": "vrms ∝ 1/T",
        "explanation": "This is incorrect. The rms speed increases with temperature, not decreases.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following is a correct statement of Faraday's law of electromagnetic induction?",
    "options": [
      {
        "text": "The induced emf is proportional to the rate of change of current",
        "explanation": "This is incomplete. The induced emf is proportional to the rate of change of magnetic flux, not just current.",
        "isCorrect": False
      },
      {
        "text": "The induced emf is proportional to the magnetic field strength",
        "explanation": "This is incomplete. The induced emf depends on the rate of change of magnetic flux, not just field strength.",
        "isCorrect": False
      },
      {
        "text": "The induced emf is proportional to the rate of change of magnetic flux",
        "explanation": "Correct! Faraday's law states that the induced emf is proportional to the rate of change of magnetic flux through a circuit.",
        "isCorrect": True
      },
      {
        "text": "The induced emf is proportional to the area of the loop",
        "explanation": "This is incomplete. The induced emf depends on the rate of change of magnetic flux, which includes area but is not solely dependent on it.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the energy levels (En) of a hydrogen atom and the principal quantum number (n)?",
    "options": [
      {
        "text": "En ∝ n",
        "explanation": "This is incorrect. The energy levels are proportional to 1/n².",
        "isCorrect": False
      },
      {
        "text": "En ∝ n²",
        "explanation": "This is incorrect. The energy levels are proportional to 1/n².",
        "isCorrect": False
      },
      {
        "text": "En ∝ 1/n",
        "explanation": "This is incorrect. The energy levels are proportional to 1/n².",
        "isCorrect": False
      },
      {
        "text": "En ∝ 1/n²",
        "explanation": "Correct! The energy levels of a hydrogen atom are given by En = -13.6 eV/n², so En is proportional to 1/n².",
        "isCorrect": True
      }
    ]
  },
  {
    "text": "Which of the following statements about capacitors in series is correct?",
    "options": [
      {
        "text": "The equivalent capacitance is the sum of the individual capacitances",
        "explanation": "This is incorrect. For capacitors in series, the reciprocal of the equivalent capacitance equals the sum of the reciprocals of the individual capacitances.",
        "isCorrect": False
      },
      {
        "text": "The equivalent capacitance is always greater than any individual capacitance",
        "explanation": "This is incorrect. For capacitors in series, the equivalent capacitance is always less than the smallest individual capacitance.",
        "isCorrect": False
      },
      {
        "text": "The equivalent capacitance is always less than the smallest individual capacitance",
        "explanation": "Correct! For capacitors in series, the equivalent capacitance is always less than the smallest individual capacitance.",
        "isCorrect": True
      },
      {
        "text": "The charge is different on each capacitor",
        "explanation": "This is incorrect. For capacitors in series, the charge is the same on each capacitor.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the pressure (P) and volume (V) of an ideal gas during an isothermal process?",
    "options": [
      {
        "text": "P ∝ V",
        "explanation": "This is incorrect. For an isothermal process, pressure is inversely proportional to volume.",
        "isCorrect": False
      },
      {
        "text": "P ∝ 1/V",
        "explanation": "Correct! For an isothermal process, PV = constant, so P ∝ 1/V (Boyle's Law).",
        "isCorrect": True
      },
      {
        "text": "P ∝ V²",
        "explanation": "This is incorrect. For an isothermal process, pressure is inversely proportional to volume.",
        "isCorrect": False
      },
      {
        "text": "P ∝ √V",
        "explanation": "This is incorrect. For an isothermal process, pressure is inversely proportional to volume.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following is the correct expression for the Doppler effect for sound?",
    "options": [
      {
        "text": "f' = f(v/(v±vs))",
        "explanation": "This is incorrect. The correct expression accounts for both source and observer motion.",
        "isCorrect": False
      },
      {
        "text": "f' = f(v±vo)/(v±vs)",
        "explanation": "Correct! This is the general expression for the Doppler effect, where v is the speed of sound, vo is the observer velocity, and vs is the source velocity.",
        "isCorrect": True
      },
      {
        "text": "f' = f(v±vs)/(v±vo)",
        "explanation": "This is incorrect. The correct expression has the observer term in the numerator and the source term in the denominator.",
        "isCorrect": False
      },
      {
        "text": "f' = f(v±vo)",
        "explanation": "This is incorrect. The correct expression accounts for both source and observer motion.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the half-life (T1/2) and decay constant (λ) of a radioactive isotope?",
    "options": [
      {
        "text": "T1/2 = λ",
        "explanation": "This is incorrect. The half-life is related to the decay constant by T1/2 = ln(2)/λ.",
        "isCorrect": False
      },
      {
        "text": "T1/2 = 1/λ",
        "explanation": "This is incorrect. The half-life is related to the decay constant by T1/2 = ln(2)/λ.",
        "isCorrect": False
      },
      {
        "text": "T1/2 = ln(2)/λ",
        "explanation": "Correct! The half-life is related to the decay constant by T1/2 = ln(2)/λ or T1/2 = 0.693/λ.",
        "isCorrect": True
      },
      {
        "text": "T1/2 = λ/ln(2)",
        "explanation": "This is incorrect. The half-life is related to the decay constant by T1/2 = ln(2)/λ.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following statements about the uncertainty principle is correct?",
    "options": [
      {
        "text": "It is impossible to measure both position and momentum with perfect accuracy due to experimental limitations",
        "explanation": "This is incorrect. The uncertainty principle is a fundamental limit, not just an experimental limitation.",
        "isCorrect": False
      },
      {
        "text": "The product of the uncertainties in position and momentum must be greater than or equal to ħ/2",
        "explanation": "Correct! The uncertainty principle states that ΔxΔp ≥ ħ/2, where ħ is the reduced Planck constant.",
        "isCorrect": True
      },
      {
        "text": "It applies only to subatomic particles",
        "explanation": "This is incorrect. The uncertainty principle applies to all wave-like systems, though its effects are most noticeable at the quantum scale.",
        "isCorrect": False
      },
      {
        "text": "It states that energy and time can be measured with perfect accuracy simultaneously",
        "explanation": "This is incorrect. The uncertainty principle also applies to energy and time: ΔEΔt ≥ ħ/2.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the electric field (E) and the electric potential (V) in a uniform field?",
    "options": [
      {
        "text": "E = -dV/dx",
        "explanation": "Correct! The electric field is the negative gradient of the electric potential.",
        "isCorrect": True
      },
      {
        "text": "E = dV/dx",
        "explanation": "This is incorrect. The electric field is the negative gradient of the electric potential.",
        "isCorrect": False
      },
      {
        "text": "E = V/d",
        "explanation": "This is a special case for a uniform field between parallel plates, but the general relationship is E = -dV/dx.",
        "isCorrect": False
      },
      {
        "text": "E = V × d",
        "explanation": "This is incorrect. The electric field is the negative gradient of the electric potential.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following is the correct expression for the centripetal force on an object moving in a circle?",
    "options": [
      {
        "text": "F = mv²/r",
        "explanation": "Correct! The centripetal force is given by F = mv²/r, where m is mass, v is velocity, and r is radius.",
        "isCorrect": True
      },
      {
        "text": "F = mr²/v",
        "explanation": "This is incorrect. The centripetal force is F = mv²/r.",
        "isCorrect": False
      },
      {
        "text": "F = mv/r²",
        "explanation": "This is incorrect. The centripetal force is F = mv²/r.",
        "isCorrect": False
      },
      {
        "text": "F = mrv",
        "explanation": "This is incorrect. The centripetal force is F = mv²/r.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the work done (W) and the change in kinetic energy (ΔK) according to the work-energy theorem?",
    "options": [
      {
        "text": "W = ΔK",
        "explanation": "Correct! The work-energy theorem states that the net work done on an object equals its change in kinetic energy.",
        "isCorrect": True
      },
      {
        "text": "W = ΔK/2",
        "explanation": "This is incorrect. The work-energy theorem states that W = ΔK.",
        "isCorrect": False
      },
      {
        "text": "W = 2ΔK",
        "explanation": "This is incorrect. The work-energy theorem states that W = ΔK.",
        "isCorrect": False
      },
      {
        "text": "W = ΔK²",
        "explanation": "This is incorrect. The work-energy theorem states that W = ΔK.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following statements about the specific heat capacity of a substance is correct?",
    "options": [
      {
        "text": "It is the amount of heat required to raise the temperature of 1 kg of the substance by 1°C",
        "explanation": "Correct! The specific heat capacity is the amount of heat energy required to raise the temperature of 1 kg of a substance by 1°C or 1 K.",
        "isCorrect": True
      },
      {
        "text": "It is the amount of heat required to change the state of 1 kg of the substance",
        "explanation": "This is incorrect. This describes the specific latent heat, not the specific heat capacity.",
        "isCorrect": False
      },
      {
        "text": "It is the amount of heat required to raise the temperature of the substance by 1°C",
        "explanation": "This is incorrect. The specific heat capacity refers to a specific mass (1 kg) of the substance.",
        "isCorrect": False
      },
      {
        "text": "It is the amount of heat required to raise the temperature of 1 mol of the substance by 1°C",
        "explanation": "This is incorrect. This describes the molar heat capacity, not the specific heat capacity.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the magnetic field (B) inside a solenoid and the current (I) flowing through it?",
    "options": [
      {
        "text": "B ∝ I²",
        "explanation": "This is incorrect. The magnetic field is directly proportional to the current.",
        "isCorrect": False
      },
      {
        "text": "B ∝ I",
        "explanation": "Correct! The magnetic field inside a solenoid is directly proportional to the current: B = μ₀nI, where n is the number of turns per unit length.",
        "isCorrect": True
      },
      {
        "text": "B ∝ √I",
        "explanation": "This is incorrect. The magnetic field is directly proportional to the current.",
        "isCorrect": False
      },
      {
        "text": "B ∝ 1/I",
        "explanation": "This is incorrect. The magnetic field is directly proportional to the current, not inversely proportional.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following is the correct expression for the total energy of an electron in a hydrogen atom?",
    "options": [
      {
        "text": "E = -13.6 eV × n²",
        "explanation": "This is incorrect. The energy is inversely proportional to n².",
        "isCorrect": False
      },
      {
        "text": "E = -13.6 eV/n²",
        "explanation": "Correct! The energy levels of a hydrogen atom are given by E = -13.6 eV/n², where n is the principal quantum number.",
        "isCorrect": True
      },
      {
        "text": "E = 13.6 eV/n²",
        "explanation": "This is incorrect. The energy is negative and equals -13.6 eV/n².",
        "isCorrect": False
      },
      {
        "text": "E = -13.6 eV × n",
        "explanation": "This is incorrect. The energy is inversely proportional to n².",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the frequency (f) and period (T) of a wave?",
    "options": [
      {
        "text": "f = T",
        "explanation": "This is incorrect. Frequency and period are reciprocals of each other.",
        "isCorrect": False
      },
      {
        "text": "f = 1/T",
        "explanation": "Correct! Frequency is the reciprocal of the period: f = 1/T.",
        "isCorrect": True
      },
      {
        "text": "f = T²",
        "explanation": "This is incorrect. Frequency and period are reciprocals of each other.",
        "isCorrect": False
      },
      {
        "text": "f = √T",
        "explanation": "This is incorrect. Frequency and period are reciprocals of each other.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following statements about the photoelectric effect supports the particle nature of light?",
    "options": [
      {
        "text": "The intensity of light affects the energy of emitted electrons",
        "explanation": "This is incorrect. The energy of emitted electrons depends on frequency, not intensity, which supports the particle nature of light.",
        "isCorrect": False
      },
      {
        "text": "There is a threshold frequency below which no electrons are emitted regardless of intensity",
        "explanation": "Correct! This observation supports the particle (photon) nature of light, as it suggests that light energy comes in discrete packets.",
        "isCorrect": True
      },
      {
        "text": "The number of emitted electrons is proportional to the frequency of light",
        "explanation": "This is incorrect. The number of emitted electrons is proportional to intensity, not frequency.",
        "isCorrect": False
      },
      {
        "text": "Electrons are emitted after a time delay when light hits the metal surface",
        "explanation": "This is incorrect. The immediate emission of electrons (no time delay) actually supports the particle nature of light.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the resistance (R) of a wire and its length (L) and cross-sectional area (A)?",
    "options": [
      {
        "text": "R ∝ L/A",
        "explanation": "Correct! The resistance is directly proportional to length and inversely proportional to cross-sectional area: R = ρL/A.",
        "isCorrect": True
      },
      {
        "text": "R ∝ L×A",
        "explanation": "This is incorrect. The resistance is directly proportional to length and inversely proportional to cross-sectional area.",
        "isCorrect": False
      },
      {
        "text": "R ∝ A/L",
        "explanation": "This is incorrect. The resistance is directly proportional to length and inversely proportional to cross-sectional area.",
        "isCorrect": False
      },
      {
        "text": "R ∝ √(L×A)",
        "explanation": "This is incorrect. The resistance is directly proportional to length and inversely proportional to cross-sectional area.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following is the correct expression for the force between two point charges according to Coulomb's law?",
    "options": [
      {
        "text": "F = kq₁q₂/r",
        "explanation": "This is incorrect. The force is inversely proportional to the square of the distance.",
        "isCorrect": False
      },
      {
        "text": "F = kq₁q₂/r²",
        "explanation": "Correct! Coulomb's law states that F = kq₁q₂/r², where k is the electrostatic constant.",
        "isCorrect": True
      },
      {
        "text": "F = kq₁q₂r",
        "explanation": "This is incorrect. The force is inversely proportional to the square of the distance, not directly proportional.",
        "isCorrect": False
      },
      {
        "text": "F = k(q₁+q₂)/r²",
        "explanation": "This is incorrect. Coulomb's law involves the product of charges, not their sum.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the angular velocity (ω) and linear velocity (v) of an object moving in a circle?",
    "options": [
      {
        "text": "v = ω/r",
        "explanation": "This is incorrect. The linear velocity equals the angular velocity multiplied by the radius.",
        "isCorrect": False
      },
      {
        "text": "v = ω×r",
        "explanation": "Correct! The linear velocity equals the angular velocity multiplied by the radius: v = ωr.",
        "isCorrect": True
      },
      {
        "text": "v = ω×r²",
        "explanation": "This is incorrect. The linear velocity equals the angular velocity multiplied by the radius.",
        "isCorrect": False
      },
      {
        "text": "v = ω/r²",
        "explanation": "This is incorrect. The linear velocity equals the angular velocity multiplied by the radius.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following statements about the first law of thermodynamics is correct?",
    "options": [
      {
        "text": "Heat always flows from a colder body to a hotter body",
        "explanation": "This is incorrect. This is the opposite of the second law of thermodynamics.",
        "isCorrect": False
      },
      {
        "text": "The total energy of an isolated system is constant",
        "explanation": "Correct! The first law of thermodynamics is a statement of conservation of energy: ΔU = Q - W.",
        "isCorrect": True
      },
      {
        "text": "The entropy of an isolated system always decreases",
        "explanation": "This is incorrect. According to the second law of thermodynamics, the entropy of an isolated system always increases.",
        "isCorrect": False
      },
      {
        "text": "It is impossible to convert heat completely into work",
        "explanation": "This is incorrect. This is a statement of the second law of thermodynamics, not the first law.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the power (P) dissipated in a resistor and the current (I) flowing through it?",
    "options": [
      {
        "text": "P = I²R",
        "explanation": "Correct! The power dissipated in a resistor is given by P = I²R, where R is the resistance.",
        "isCorrect": True
      },
      {
        "text": "P = IR",
        "explanation": "This is incorrect. This is the expression for voltage (V = IR), not power.",
        "isCorrect": False
      },
      {
        "text": "P = I/R",
        "explanation": "This is incorrect. The power dissipated in a resistor is P = I²R.",
        "isCorrect": False
      },
      {
        "text": "P = √(IR)",
        "explanation": "This is incorrect. The power dissipated in a resistor is P = I²R.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following is the correct expression for the gravitational potential energy of an object near Earth's surface?",
    "options": [
      {
        "text": "U = mgh",
        "explanation": "Correct! The gravitational potential energy near Earth's surface is U = mgh, where m is mass, g is gravitational field strength, and h is height.",
        "isCorrect": True
      },
      {
        "text": "U = mg/h",
        "explanation": "This is incorrect. The gravitational potential energy is directly proportional to height, not inversely proportional.",
        "isCorrect": False
      },
      {
        "text": "U = m/gh",
        "explanation": "This is incorrect. The gravitational potential energy is U = mgh.",
        "isCorrect": False
      },
      {
        "text": "U = mh/g",
        "explanation": "This is incorrect. The gravitational potential energy is U = mgh.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the pressure (P), volume (V), and temperature (T) of an ideal gas?",
    "options": [
      {
        "text": "PV = nRT",
        "explanation": "Correct! This is the ideal gas law, where n is the number of moles and R is the gas constant.",
        "isCorrect": True
      },
      {
        "text": "P/V = nRT",
        "explanation": "This is incorrect. The ideal gas law is PV = nRT.",
        "isCorrect": False
      },
      {
        "text": "PT = nRV",
        "explanation": "This is incorrect. The ideal gas law is PV = nRT.",
        "isCorrect": False
      },
      {
        "text": "P = nRTV",
        "explanation": "This is incorrect. The ideal gas law is PV = nRT.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following statements about interference of waves is correct?",
    "options": [
      {
        "text": "Constructive interference occurs when the path difference is an odd multiple of half the wavelength",
        "explanation": "This is incorrect. Constructive interference occurs when the path difference is a whole number multiple of the wavelength.",
        "isCorrect": False
      },
      {
        "text": "Destructive interference occurs when the path difference is a whole number multiple of the wavelength",
        "explanation": "This is incorrect. Destructive interference occurs when the path difference is an odd multiple of half the wavelength.",
        "isCorrect": False
      },
      {
        "text": "Constructive interference occurs when the path difference is a whole number multiple of the wavelength",
        "explanation": "Correct! Constructive interference occurs when the path difference is nλ, where n is an integer.",
        "isCorrect": True
      },
      {
        "text": "Interference can only occur with light waves, not sound waves",
        "explanation": "This is incorrect. Interference can occur with all types of waves, including sound waves.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the focal length (f) of a thin lens, the object distance (u), and the image distance (v)?",
    "options": [
      {
        "text": "1/f = 1/u + 1/v",
        "explanation": "Correct! This is the lens equation, which relates the focal length to the object and image distances.",
        "isCorrect": True
      },
      {
        "text": "f = u + v",
        "explanation": "This is incorrect. The lens equation is 1/f = 1/u + 1/v.",
        "isCorrect": False
      },
      {
        "text": "1/f = u + v",
        "explanation": "This is incorrect. The lens equation is 1/f = 1/u + 1/v.",
        "isCorrect": False
      },
      {
        "text": "f = 1/u + 1/v",
        "explanation": "This is incorrect. The lens equation is 1/f = 1/u + 1/v.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following is the correct expression for the magnetic flux (Φ) through a surface?",
    "options": [
      {
        "text": "Φ = BA cos θ",
        "explanation": "Correct! The magnetic flux equals the magnetic field strength multiplied by the area and the cosine of the angle between the field and the normal to the surface.",
        "isCorrect": True
      },
      {
        "text": "Φ = BA sin θ",
        "explanation": "This is incorrect. The magnetic flux is Φ = BA cos θ, not BA sin θ.",
        "isCorrect": False
      },
      {
        "text": "Φ = B/A",
        "explanation": "This is incorrect. The magnetic flux is directly proportional to both the magnetic field and the area.",
        "isCorrect": False
      },
      {
        "text": "Φ = B + A",
        "explanation": "This is incorrect. The magnetic flux involves the product of the magnetic field and the area, not their sum.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the activity (A) of a radioactive sample and the number of undecayed nuclei (N)?",
    "options": [
      {
        "text": "A = λN",
        "explanation": "Correct! The activity equals the decay constant multiplied by the number of undecayed nuclei: A = λN.",
        "isCorrect": True
      },
      {
        "text": "A = N/λ",
        "explanation": "This is incorrect. The activity is A = λN, not N/λ.",
        "isCorrect": False
      },
      {
        "text": "A = N²",
        "explanation": "This is incorrect. The activity is directly proportional to N, not N².",
        "isCorrect": False
      },
      {
        "text": "A = λ/N",
        "explanation": "This is incorrect. The activity is directly proportional to N, not inversely proportional.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "Which of the following statements about the speed of electromagnetic waves in a vacuum is correct?",
    "options": [
      {
        "text": "All electromagnetic waves travel at the same speed in a vacuum",
        "explanation": "Correct! All electromagnetic waves, regardless of frequency or wavelength, travel at the speed of light (c) in a vacuum.",
        "isCorrect": True
      },
      {
        "text": "The speed of electromagnetic waves in a vacuum depends on their frequency",
        "explanation": "This is incorrect. The speed of electromagnetic waves in a vacuum is constant and independent of frequency.",
        "isCorrect": False
      },
      {
        "text": "The speed of electromagnetic waves in a vacuum depends on their amplitude",
        "explanation": "This is incorrect. The speed of electromagnetic waves in a vacuum is constant and independent of amplitude.",
        "isCorrect": False
      },
      {
        "text": "The speed of electromagnetic waves in a vacuum depends on their wavelength",
        "explanation": "This is incorrect. The speed of electromagnetic waves in a vacuum is constant and independent of wavelength.",
        "isCorrect": False
      }
    ]
  },
  {
    "text": "What is the relationship between the moment of inertia (I) of a rigid body and its angular momentum (L) when rotating with angular velocity (ω)?",
    "options": [
      {
        "text": "L = I/ω",
        "explanation": "This is incorrect. Angular momentum is directly proportional to angular velocity, not inversely proportional.",
        "isCorrect": False
      },
      {
        "text": "L = I + ω",
        "explanation": "This is incorrect. Angular momentum involves the product of moment of inertia and angular velocity, not their sum.",
        "isCorrect": False
      },
      {
        "text": "L = I × ω",
        "explanation": "Correct! The angular momentum equals the moment of inertia multiplied by the angular velocity: L = Iω.",
        "isCorrect": True
      },
      {
        "text": "L = I × ω²",
        "explanation": "This is incorrect. The angular momentum is L = Iω, not Iω².",
        "isCorrect": False
      }
    ]
  }
]
// Function to seed the database
async function seedDatabase() {
  try {
    // Clear existing data
    await Course.deleteMany({});
    await Question.deleteMany({});
    
    console.log('Existing data cleared');
    
    // Insert courses
    const createdCourses = await Course.insertMany(courses);
    console.log(`${createdCourses.length} courses created`);
    
    // Find the Physics (A Levels) course
    const physicsALevel = createdCourses.find(c => c.title === 'Physics (A Levels)');

    
    // Insert questions for Physics (A Levels)
    if (physicsALevel) {
      const physicsQuestions = physicsALevelQuestions.map(q => ({
        ...q,
        course: physicsALevel._id
      }));
      
      await Question.insertMany(physicsQuestions);
      console.log(`${physicsQuestions.length} questions created for Physics (A Levels)`);
    }
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();