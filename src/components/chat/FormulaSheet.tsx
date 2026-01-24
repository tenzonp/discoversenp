import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Calculator, Atom, FlaskConical, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface FormulaSheetProps {
  classLevel: string;
  trigger?: React.ReactNode;
}

const formulas: Record<string, Record<string, { title: string; formulas: { name: string; formula: string; description?: string }[] }[]>> = {
  'Class 8': {
    math: [
      {
        title: 'Basic Algebra',
        formulas: [
          { name: 'Square of Sum', formula: '(a + b)² = a² + 2ab + b²' },
          { name: 'Square of Difference', formula: '(a - b)² = a² - 2ab + b²' },
          { name: 'Difference of Squares', formula: 'a² - b² = (a + b)(a - b)' },
        ]
      },
      {
        title: 'Mensuration',
        formulas: [
          { name: 'Area of Rectangle', formula: 'A = l × b' },
          { name: 'Area of Triangle', formula: 'A = ½ × b × h' },
          { name: 'Area of Circle', formula: 'A = πr²' },
          { name: 'Circumference', formula: 'C = 2πr' },
        ]
      },
      {
        title: 'Percentage & Profit/Loss',
        formulas: [
          { name: 'Percentage', formula: 'P% = (Value/Total) × 100' },
          { name: 'Profit', formula: 'Profit = SP - CP' },
          { name: 'Loss', formula: 'Loss = CP - SP' },
          { name: 'Profit %', formula: 'Profit% = (Profit/CP) × 100' },
        ]
      }
    ],
    science: [
      {
        title: 'Physics Basics',
        formulas: [
          { name: 'Speed', formula: 'v = d/t', description: 'Distance/Time' },
          { name: 'Density', formula: 'ρ = m/V', description: 'Mass/Volume' },
          { name: 'Force', formula: 'F = m × a', description: 'Mass × Acceleration' },
        ]
      },
      {
        title: 'Simple Machines',
        formulas: [
          { name: 'Mechanical Advantage', formula: 'MA = Load/Effort' },
          { name: 'Velocity Ratio', formula: 'VR = Distance by Effort/Distance by Load' },
          { name: 'Efficiency', formula: 'η = (MA/VR) × 100%' },
        ]
      }
    ],
    chemistry: [
      {
        title: 'Basic Concepts',
        formulas: [
          { name: 'Atomic Number', formula: 'Z = Number of Protons' },
          { name: 'Mass Number', formula: 'A = Protons + Neutrons' },
          { name: 'Valency', formula: '8 - Group Number (for groups 5-7)' },
        ]
      }
    ]
  },
  'Class 9': {
    math: [
      {
        title: 'Algebra',
        formulas: [
          { name: 'Cube of Sum', formula: '(a + b)³ = a³ + 3a²b + 3ab² + b³' },
          { name: 'Cube of Difference', formula: '(a - b)³ = a³ - 3a²b + 3ab² - b³' },
          { name: 'Sum of Cubes', formula: 'a³ + b³ = (a + b)(a² - ab + b²)' },
          { name: 'Difference of Cubes', formula: 'a³ - b³ = (a - b)(a² + ab + b²)' },
        ]
      },
      {
        title: 'Quadratic Equations',
        formulas: [
          { name: 'Standard Form', formula: 'ax² + bx + c = 0' },
          { name: 'Quadratic Formula', formula: 'x = (-b ± √(b² - 4ac)) / 2a' },
          { name: 'Discriminant', formula: 'D = b² - 4ac' },
        ]
      },
      {
        title: 'Coordinate Geometry',
        formulas: [
          { name: 'Distance Formula', formula: 'd = √[(x₂-x₁)² + (y₂-y₁)²]' },
          { name: 'Midpoint', formula: 'M = ((x₁+x₂)/2, (y₁+y₂)/2)' },
          { name: 'Slope', formula: 'm = (y₂-y₁)/(x₂-x₁)' },
        ]
      }
    ],
    science: [
      {
        title: 'Motion',
        formulas: [
          { name: 'First Equation', formula: 'v = u + at' },
          { name: 'Second Equation', formula: 's = ut + ½at²' },
          { name: 'Third Equation', formula: 'v² = u² + 2as' },
        ]
      },
      {
        title: 'Work & Energy',
        formulas: [
          { name: 'Work', formula: 'W = F × d × cos θ' },
          { name: 'Kinetic Energy', formula: 'KE = ½mv²' },
          { name: 'Potential Energy', formula: 'PE = mgh' },
          { name: 'Power', formula: 'P = W/t' },
        ]
      }
    ],
    chemistry: [
      {
        title: 'Chemical Equations',
        formulas: [
          { name: 'Mole', formula: 'n = m/M', description: 'Mass/Molar Mass' },
          { name: 'Number of Particles', formula: 'N = n × Nₐ', description: 'Nₐ = 6.022×10²³' },
          { name: 'Molar Volume (STP)', formula: 'V = n × 22.4 L' },
        ]
      }
    ]
  },
  'Class 10': {
    math: [
      {
        title: 'Trigonometry',
        formulas: [
          { name: 'sin θ', formula: 'sin θ = Perpendicular/Hypotenuse' },
          { name: 'cos θ', formula: 'cos θ = Base/Hypotenuse' },
          { name: 'tan θ', formula: 'tan θ = Perpendicular/Base' },
          { name: 'Identity 1', formula: 'sin²θ + cos²θ = 1' },
          { name: 'Identity 2', formula: '1 + tan²θ = sec²θ' },
          { name: 'Identity 3', formula: '1 + cot²θ = cosec²θ' },
        ]
      },
      {
        title: 'Circle Theorems',
        formulas: [
          { name: 'Arc Length', formula: 'l = (θ/360°) × 2πr' },
          { name: 'Sector Area', formula: 'A = (θ/360°) × πr²' },
        ]
      },
      {
        title: 'Statistics',
        formulas: [
          { name: 'Mean', formula: 'x̄ = Σx/n' },
          { name: 'Median (odd)', formula: 'M = ((n+1)/2)th term' },
          { name: 'Mode', formula: 'Most frequent value' },
          { name: 'Standard Deviation', formula: 'σ = √[Σ(x-x̄)²/n]' },
        ]
      }
    ],
    science: [
      {
        title: 'Electricity',
        formulas: [
          { name: "Ohm's Law", formula: 'V = IR' },
          { name: 'Power', formula: 'P = VI = I²R = V²/R' },
          { name: 'Resistance (Series)', formula: 'R = R₁ + R₂ + R₃' },
          { name: 'Resistance (Parallel)', formula: '1/R = 1/R₁ + 1/R₂ + 1/R₃' },
        ]
      },
      {
        title: 'Optics',
        formulas: [
          { name: 'Mirror Formula', formula: '1/f = 1/v + 1/u' },
          { name: 'Magnification', formula: 'm = -v/u = h₂/h₁' },
          { name: 'Lens Power', formula: 'P = 1/f (in meters)' },
        ]
      }
    ],
    chemistry: [
      {
        title: 'Acids & Bases',
        formulas: [
          { name: 'pH', formula: 'pH = -log[H⁺]' },
          { name: 'pOH', formula: 'pOH = -log[OH⁻]' },
          { name: 'pH + pOH', formula: 'pH + pOH = 14' },
        ]
      },
      {
        title: 'Carbon Compounds',
        formulas: [
          { name: 'Alkane', formula: 'CₙH₂ₙ₊₂' },
          { name: 'Alkene', formula: 'CₙH₂ₙ' },
          { name: 'Alkyne', formula: 'CₙH₂ₙ₋₂' },
        ]
      }
    ]
  },
  'Class 11': {
    math: [
      {
        title: 'Sets & Functions',
        formulas: [
          { name: 'Union', formula: 'n(A∪B) = n(A) + n(B) - n(A∩B)' },
          { name: 'De Morgan\'s Law', formula: '(A∪B)\' = A\'∩B\'' },
          { name: 'Composite Function', formula: '(fog)(x) = f(g(x))' },
        ]
      },
      {
        title: 'Trigonometry',
        formulas: [
          { name: 'Compound Angle (sin)', formula: 'sin(A±B) = sinA·cosB ± cosA·sinB' },
          { name: 'Compound Angle (cos)', formula: 'cos(A±B) = cosA·cosB ∓ sinA·sinB' },
          { name: 'Double Angle (sin)', formula: 'sin2A = 2sinA·cosA' },
          { name: 'Double Angle (cos)', formula: 'cos2A = cos²A - sin²A' },
        ]
      },
      {
        title: 'Limits & Derivatives',
        formulas: [
          { name: 'Limit Definition', formula: 'f\'(x) = lim(h→0) [f(x+h)-f(x)]/h' },
          { name: 'Power Rule', formula: 'd/dx(xⁿ) = nxⁿ⁻¹' },
          { name: 'Product Rule', formula: 'd/dx(uv) = u\'v + uv\'' },
          { name: 'Quotient Rule', formula: 'd/dx(u/v) = (u\'v - uv\')/v²' },
        ]
      }
    ],
    physics: [
      {
        title: 'Mechanics',
        formulas: [
          { name: 'Projectile Range', formula: 'R = u²sin2θ/g' },
          { name: 'Max Height', formula: 'H = u²sin²θ/2g' },
          { name: 'Time of Flight', formula: 'T = 2u·sinθ/g' },
          { name: 'Centripetal Force', formula: 'F = mv²/r' },
        ]
      },
      {
        title: 'Gravitation',
        formulas: [
          { name: 'Gravitational Force', formula: 'F = Gm₁m₂/r²' },
          { name: 'Acceleration due to Gravity', formula: 'g = GM/R²' },
          { name: 'Escape Velocity', formula: 'vₑ = √(2gR)' },
          { name: 'Orbital Velocity', formula: 'vₒ = √(gR)' },
        ]
      },
      {
        title: 'Waves',
        formulas: [
          { name: 'Wave Equation', formula: 'v = fλ' },
          { name: 'Beat Frequency', formula: 'fᵦ = |f₁ - f₂|' },
          { name: 'Doppler Effect', formula: 'f\' = f(v±vₒ)/(v∓vₛ)' },
        ]
      }
    ],
    chemistry: [
      {
        title: 'Atomic Structure',
        formulas: [
          { name: 'Energy of Orbit', formula: 'Eₙ = -13.6/n² eV' },
          { name: 'Radius of Orbit', formula: 'rₙ = 0.529n² Å' },
          { name: 'De Broglie Wavelength', formula: 'λ = h/mv' },
        ]
      },
      {
        title: 'Thermodynamics',
        formulas: [
          { name: 'First Law', formula: 'ΔU = q + w' },
          { name: 'Enthalpy', formula: 'ΔH = ΔU + PΔV' },
          { name: 'Gibbs Free Energy', formula: 'ΔG = ΔH - TΔS' },
        ]
      },
      {
        title: 'Equilibrium',
        formulas: [
          { name: 'Equilibrium Constant', formula: 'Kc = [Products]/[Reactants]' },
          { name: 'Relation Kp & Kc', formula: 'Kp = Kc(RT)^Δn' },
        ]
      }
    ]
  },
  'Class 12': {
    math: [
      {
        title: 'Integration',
        formulas: [
          { name: 'Power Rule', formula: '∫xⁿdx = xⁿ⁺¹/(n+1) + C' },
          { name: 'Exponential', formula: '∫eˣdx = eˣ + C' },
          { name: 'Logarithmic', formula: '∫(1/x)dx = ln|x| + C' },
          { name: 'By Parts', formula: '∫u·dv = uv - ∫v·du' },
        ]
      },
      {
        title: 'Vectors',
        formulas: [
          { name: 'Dot Product', formula: 'a⃗·b⃗ = |a||b|cosθ' },
          { name: 'Cross Product', formula: '|a⃗×b⃗| = |a||b|sinθ' },
          { name: 'Unit Vector', formula: 'â = a⃗/|a⃗|' },
        ]
      },
      {
        title: 'Probability',
        formulas: [
          { name: 'Conditional', formula: 'P(A|B) = P(A∩B)/P(B)' },
          { name: "Bayes' Theorem", formula: 'P(A|B) = P(B|A)P(A)/P(B)' },
          { name: 'Binomial Distribution', formula: 'P(X=r) = ⁿCᵣpʳqⁿ⁻ʳ' },
        ]
      }
    ],
    physics: [
      {
        title: 'Electrostatics',
        formulas: [
          { name: "Coulomb's Law", formula: 'F = kq₁q₂/r²' },
          { name: 'Electric Field', formula: 'E = F/q = kQ/r²' },
          { name: 'Electric Potential', formula: 'V = kQ/r' },
          { name: 'Capacitance', formula: 'C = Q/V' },
        ]
      },
      {
        title: 'Magnetism',
        formulas: [
          { name: 'Magnetic Force', formula: 'F = qvBsinθ' },
          { name: 'Biot-Savart Law', formula: 'dB = (μ₀/4π)(Idl×r̂)/r²' },
          { name: "Ampere's Law", formula: '∮B·dl = μ₀I' },
        ]
      },
      {
        title: 'Modern Physics',
        formulas: [
          { name: 'Photoelectric Effect', formula: 'hν = φ + ½mv²max' },
          { name: 'Einstein\'s Equation', formula: 'E = mc²' },
          { name: 'Decay Law', formula: 'N = N₀e^(-λt)' },
          { name: 'Half-life', formula: 't½ = 0.693/λ' },
        ]
      }
    ],
    chemistry: [
      {
        title: 'Electrochemistry',
        formulas: [
          { name: 'Nernst Equation', formula: 'E = E° - (RT/nF)lnQ' },
          { name: "Faraday's First Law", formula: 'm = Zit' },
          { name: 'Cell EMF', formula: 'E°cell = E°cathode - E°anode' },
        ]
      },
      {
        title: 'Chemical Kinetics',
        formulas: [
          { name: 'Rate Law', formula: 'Rate = k[A]ⁿ[B]ᵐ' },
          { name: 'First Order', formula: 'k = (2.303/t)log(a/(a-x))' },
          { name: 'Arrhenius Equation', formula: 'k = Ae^(-Ea/RT)' },
        ]
      },
      {
        title: 'Solutions',
        formulas: [
          { name: "Raoult's Law", formula: 'P = P°χ' },
          { name: 'Elevation in BP', formula: 'ΔTb = Kb·m' },
          { name: 'Depression in FP', formula: 'ΔTf = Kf·m' },
          { name: 'Osmotic Pressure', formula: 'π = iCRT' },
        ]
      }
    ]
  }
};

export function FormulaSheet({ classLevel, trigger }: FormulaSheetProps) {
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  
  const classFormulas = formulas[classLevel] || formulas['Class 10'];
  const subjects = Object.keys(classFormulas);

  const copyFormula = (formula: string) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    toast.success('Formula copied!');
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'math': return <Calculator className="h-4 w-4" />;
      case 'physics': return <Atom className="h-4 w-4" />;
      case 'chemistry': return <FlaskConical className="h-4 w-4" />;
      case 'science': return <Atom className="h-4 w-4" />;
      default: return <Calculator className="h-4 w-4" />;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Calculator className="h-4 w-4" />
            Formula Sheet
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Formula Sheet - {classLevel}
          </SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue={subjects[0]} className="mt-4">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${subjects.length}, 1fr)` }}>
            {subjects.map(subject => (
              <TabsTrigger key={subject} value={subject} className="gap-2 capitalize">
                {getSubjectIcon(subject)}
                {subject}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {subjects.map(subject => (
            <TabsContent key={subject} value={subject}>
              <ScrollArea className="h-[calc(100vh-200px)] pr-4">
                <div className="space-y-6 pb-8">
                  {classFormulas[subject].map((section, idx) => (
                    <div key={idx} className="space-y-3">
                      <h3 className="font-semibold text-sm text-primary flex items-center gap-2">
                        {section.title}
                      </h3>
                      <div className="space-y-2">
                        {section.formulas.map((item, fIdx) => (
                          <div
                            key={fIdx}
                            className="group p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/30 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground mb-1">{item.name}</p>
                                <p className="font-mono text-sm font-medium text-foreground">{item.formula}</p>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => copyFormula(item.formula)}
                              >
                                {copiedFormula === item.formula ? (
                                  <Check className="h-3.5 w-3.5 text-green-500" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
