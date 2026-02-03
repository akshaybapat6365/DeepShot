import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Activity,
  TrendingUp,
  Clock,
  Shield,
  Brain,
  Zap,
  Microscope,
} from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { Headline, Body } from "./typography";

interface LearnMorePageProps {
  onClose: () => void;
}

const slides = [
  {
    id: "intro",
    title: "Understanding TRT",
    subtitle: "The Science of Hormonal Balance",
    icon: Microscope,
    content: {
      headline: "What is Testosterone Replacement Therapy?",
      body: "Testosterone Replacement Therapy (TRT) is a medically supervised treatment designed to restore optimal testosterone levels in men experiencing hypogonadism or age-related decline. Think of it as tuning your body's hormonal orchestra back to its prime performance.",
      stats: [
        {
          label: "Men affected",
          value: "2-6%",
          description: "of men over 30 have low T",
        },
        {
          label: "Symptoms onset",
          value: "1% per year",
          description: "decline after age 30",
        },
        {
          label: "Treatment efficacy",
          value: "85%+",
          description: "report significant improvement",
        },
      ],
    },
  },
  {
    id: "hpga",
    title: "The HPG Axis",
    subtitle: "Your Body's Hormonal Command Center",
    icon: Brain,
    content: {
      headline: "The Hypothalamic-Pituitary-Gonadal Axis",
      body: "Your body operates like a sophisticated feedback loop. The hypothalamus (brain) signals the pituitary gland, which instructs the testes to produce testosterone. When levels drop, this axis compensates. TRT works by supplementing what your body naturally produces.",
      visual: "axis",
    },
  },
  {
    id: "protocols",
    title: "Injection Protocols",
    subtitle: "Finding Your Optimal Rhythm",
    icon: Clock,
    content: {
      headline: "Understanding Protocol Types",
      body: "Different protocols match different lifestyles and physiological needs. From daily micro-doses to weekly injections, each approach balances convenience with stable hormone levels.",
      protocols: [
        {
          name: "ED (Every Day)",
          frequency: "Daily",
          stability: "Highest",
          bestFor: "Maximum stability, minimal peaks",
        },
        {
          name: "EOD (Every Other Day)",
          frequency: "3-4x/week",
          stability: "Very High",
          bestFor: "Balance of convenience and stability",
        },
        {
          name: "E3D (Every 3rd Day)",
          frequency: "2-3x/week",
          stability: "High",
          bestFor: "Most common, good balance",
        },
        {
          name: "E3.5D (Twice Weekly)",
          frequency: "2x/week",
          stability: "Good",
          bestFor: "Popular protocol, manageable",
        },
        {
          name: "E7D (Weekly)",
          frequency: "1x/week",
          stability: "Moderate",
          bestFor: "Maximum convenience",
        },
      ],
    },
  },
  {
    id: "pharmacokinetics",
    title: "Half-Life & Levels",
    subtitle: "The Science of Timing",
    icon: Activity,
    content: {
      headline: "Testosterone Cypionate/Enanthate",
      body: "These esters have approximately 8-day half-lives. This means levels peak 24-48 hours post-injection, then gradually decline. More frequent injections create smoother levels, reducing the roller-coaster effect.",
      visual: "graph",
    },
  },
  {
    id: "benefits",
    title: "Clinical Benefits",
    subtitle: "Evidence-Based Improvements",
    icon: TrendingUp,
    content: {
      headline: "What the Research Shows",
      body: "Multiple peer-reviewed studies demonstrate significant improvements across physical, cognitive, and emotional domains when TRT is properly administered.",
      benefits: [
        {
          category: "Physical",
          items: [
            "Increased muscle mass & strength",
            "Reduced body fat",
            "Improved bone density",
            "Enhanced energy levels",
          ],
        },
        {
          category: "Cognitive",
          items: [
            "Better focus & concentration",
            "Improved memory",
            "Enhanced decision-making",
            "Reduced brain fog",
          ],
        },
        {
          category: "Emotional",
          items: [
            "Improved mood",
            "Reduced anxiety & depression",
            "Better sleep quality",
            "Increased motivation",
          ],
        },
        {
          category: "Sexual",
          items: [
            "Improved libido",
            "Better erectile function",
            "Enhanced sexual satisfaction",
            "Increased confidence",
          ],
        },
      ],
    },
  },
  {
    id: "safety",
    title: "Safety & Monitoring",
    subtitle: "Responsible Treatment",
    icon: Shield,
    content: {
      headline: "Best Practices for Optimal Results",
      body: "Successful TRT requires medical supervision, regular blood work, and individualized protocols. Key markers include total testosterone, free testosterone, estradiol, hematocrit, and PSA levels.",
      checklist: [
        "Initial comprehensive hormone panel",
        "Regular monitoring (every 3-6 months)",
        "Individualized dosing based on response",
        "Lifestyle optimization (sleep, nutrition, exercise)",
        "Ancillary medications when needed (AI, HCG)",
        "Long-term cardiovascular monitoring",
      ],
    },
  },
];

export function LearnMorePage({ onClose }: LearnMorePageProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl overflow-y-auto"
    >
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
              <Icon className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {slide.title}
              </h2>
              <p className="text-sm text-white/50">{slide.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-white/70" />
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setDirection(idx > currentSlide ? 1 : -1);
                setCurrentSlide(idx);
              }}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentSlide
                  ? "w-8 bg-amber-500"
                  : "w-4 bg-white/20 hover:bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-24">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            initial={{ opacity: 0, x: direction > 0 ? 50 : -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction > 0 ? -50 : 50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="min-h-[60vh]"
          >
            {slide.id === "intro" && (
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div>
                  <ScrollReveal>
                    <Headline className="mb-6">
                      {slide.content.headline}
                    </Headline>
                    <Body className="text-lg mb-8">{slide.content.body}</Body>

                    <div className="grid grid-cols-3 gap-4">
                      {slide.content.stats?.map((stat, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="glass-card-2026 p-4 text-center"
                        >
                          <p className="text-2xl font-bold text-amber-400">
                            {stat.value}
                          </p>
                          <p className="text-sm font-medium text-white">
                            {stat.label}
                          </p>
                          <p className="text-xs text-white/50 mt-1">
                            {stat.description}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </ScrollReveal>
                </div>

                <div className="relative">
                  <HormoneCycleVisual />
                </div>
              </div>
            )}

            {slide.id === "hpga" && (
              <div className="max-w-4xl mx-auto">
                <ScrollReveal>
                  <Headline className="text-center mb-6">
                    {slide.content.headline}
                  </Headline>
                  <Body className="text-center text-lg mb-12 max-w-2xl mx-auto">
                    {slide.content.body}
                  </Body>
                </ScrollReveal>

                <HPGAxisVisual />
              </div>
            )}

            {slide.id === "protocols" && (
              <div className="max-w-5xl mx-auto">
                <ScrollReveal>
                  <Headline className="text-center mb-6">
                    {slide.content.headline}
                  </Headline>
                  <Body className="text-center text-lg mb-12 max-w-2xl mx-auto">
                    {slide.content.body}
                  </Body>
                </ScrollReveal>

                <div className="grid gap-4">
                  {slide.content.protocols?.map((protocol, idx) => (
                    <motion.div
                      key={protocol.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card-2026 p-6 flex items-center gap-6"
                    >
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                        <Clock className="w-8 h-8 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {protocol.name}
                        </h3>
                        <p className="text-white/60">
                          Best for: {protocol.bestFor}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/50">Frequency</p>
                        <p className="text-lg font-medium text-white">
                          {protocol.frequency}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-white/50">Stability</p>
                        <p className="text-lg font-medium text-emerald-400">
                          {protocol.stability}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {slide.id === "pharmacokinetics" && (
              <div className="max-w-5xl mx-auto">
                <ScrollReveal>
                  <Headline className="text-center mb-6">
                    {slide.content.headline}
                  </Headline>
                  <Body className="text-center text-lg mb-12 max-w-2xl mx-auto">
                    {slide.content.body}
                  </Body>
                </ScrollReveal>

                <TestosteroneCurveVisual />
              </div>
            )}

            {slide.id === "benefits" && (
              <div className="max-w-6xl mx-auto">
                <ScrollReveal>
                  <Headline className="text-center mb-6">
                    {slide.content.headline}
                  </Headline>
                  <Body className="text-center text-lg mb-12 max-w-2xl mx-auto">
                    {slide.content.body}
                  </Body>
                </ScrollReveal>

                <div className="grid md:grid-cols-2 gap-6">
                  {slide.content.benefits?.map((category, idx) => (
                    <motion.div
                      key={category.category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="glass-card-2026 p-6"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            category.category === "Physical"
                              ? "bg-blue-500/20 text-blue-400"
                              : category.category === "Cognitive"
                                ? "bg-purple-500/20 text-purple-400"
                                : category.category === "Emotional"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {category.category === "Physical" && (
                            <Zap className="w-5 h-5" />
                          )}
                          {category.category === "Cognitive" && (
                            <Brain className="w-5 h-5" />
                          )}
                          {category.category === "Emotional" && (
                            <Activity className="w-5 h-5" />
                          )}
                          {category.category === "Sexual" && (
                            <TrendingUp className="w-5 h-5" />
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-white">
                          {category.category}
                        </h3>
                      </div>
                      <ul className="space-y-2">
                        {category.items.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-white/70"
                          >
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {slide.id === "safety" && (
              <div className="max-w-4xl mx-auto">
                <ScrollReveal>
                  <Headline className="text-center mb-6">
                    {slide.content.headline}
                  </Headline>
                  <Body className="text-center text-lg mb-12 max-w-2xl mx-auto">
                    {slide.content.body}
                  </Body>
                </ScrollReveal>

                <div className="glass-card-2026 p-8">
                  <div className="grid gap-4">
                    {slide.content.checklist?.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-4 p-4 rounded-xl bg-white/5"
                      >
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <Shield className="w-4 h-4 text-emerald-400" />
                        </div>
                        <p className="text-white/90">{item}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <p className="text-white/50 text-sm">
                    Always consult with a qualified healthcare provider before
                    starting TRT. This information is for educational purposes
                    only.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-md border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={prevSlide}
            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white/10 transition-colors text-white/70 hover:text-white"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <span className="text-white/50">
            {currentSlide + 1} / {slides.length}
          </span>

          <button
            onClick={nextSlide}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 transition-colors"
          >
            {currentSlide === slides.length - 1 ? "Finish" : "Next"}
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function HormoneCycleVisual() {
  return (
    <div className="relative w-full aspect-square max-w-md mx-auto">
      <svg viewBox="0 0 400 400" className="w-full h-full">
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
        <circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />
        <circle
          cx="200"
          cy="200"
          r="100"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1"
        />

        <motion.circle
          cx="200"
          cy="200"
          r="60"
          fill="none"
          stroke="rgba(255,149,0,0.3)"
          strokeWidth="2"
          animate={{ r: [60, 180], opacity: [0.5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        />

        <motion.circle
          cx="200"
          cy="200"
          r="60"
          fill="none"
          stroke="rgba(255,149,0,0.3)"
          strokeWidth="2"
          animate={{ r: [60, 180], opacity: [0.5, 0] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeOut",
            delay: 1.5,
          }}
        />

        <motion.circle
          cx="200"
          cy="200"
          r="40"
          fill="url(#coreGradient)"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
          <motion.g key={i}>
            <motion.circle
              cx={200 + 120 * Math.cos((angle * Math.PI) / 180)}
              cy={200 + 120 * Math.sin((angle * Math.PI) / 180)}
              r="8"
              fill="rgba(255,149,0,0.8)"
              animate={{
                cx: [
                  200 + 120 * Math.cos((angle * Math.PI) / 180),
                  200 + 120 * Math.cos(((angle + 360) * Math.PI) / 180),
                ],
                cy: [
                  200 + 120 * Math.sin((angle * Math.PI) / 180),
                  200 + 120 * Math.sin(((angle + 360) * Math.PI) / 180),
                ],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
          </motion.g>
        ))}

        <defs>
          <radialGradient id="coreGradient">
            <stop offset="0%" stopColor="#FF9500" />
            <stop offset="100%" stopColor="#FF6D00" />
          </radialGradient>
        </defs>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <p className="text-3xl font-bold text-white">T</p>
        </motion.div>
      </div>
    </div>
  );
}

function HPGAxisVisual() {
  const nodes = [
    {
      id: "hypothalamus",
      label: "Hypothalamus",
      x: 200,
      y: 80,
      description: "Brain command center",
    },
    {
      id: "pituitary",
      label: "Pituitary",
      x: 200,
      y: 200,
      description: "Master gland",
    },
    {
      id: "testes",
      label: "Testes",
      x: 200,
      y: 320,
      description: "Testosterone production",
    },
  ];

  return (
    <div className="relative w-full max-w-lg mx-auto py-8">
      <svg viewBox="0 0 400 400" className="w-full h-auto">
        <motion.line
          x1="200"
          y1="110"
          x2="200"
          y2="170"
          stroke="rgba(255,149,0,0.5)"
          strokeWidth="2"
          strokeDasharray="5,5"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        <motion.line
          x1="200"
          y1="230"
          x2="200"
          y2="290"
          stroke="rgba(255,149,0,0.5)"
          strokeWidth="2"
          strokeDasharray="5,5"
          animate={{ strokeDashoffset: [0, -20] }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />

        <path
          d="M 280 320 Q 350 320 350 200 Q 350 80 280 80"
          fill="none"
          stroke="rgba(139,92,246,0.3)"
          strokeWidth="2"
          strokeDasharray="5,5"
        />

        <text
          x="360"
          y="200"
          fill="rgba(139,92,246,0.6)"
          fontSize="12"
          textAnchor="middle"
        >
          Negative Feedback
        </text>

        {nodes.map((node, i) => (
          <g key={node.id}>
            <motion.circle
              cx={node.x}
              cy={node.y}
              r="35"
              fill="rgba(255,255,255,0.05)"
              stroke="rgba(255,149,0,0.5)"
              strokeWidth="2"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.2 }}
            />
            <text
              x={node.x}
              y={node.y + 5}
              fill="white"
              fontSize="12"
              textAnchor="middle"
              fontWeight="600"
            >
              {node.label}
            </text>

            <text
              x={node.x}
              y={node.y + 55}
              fill="rgba(255,255,255,0.5)"
              fontSize="11"
              textAnchor="middle"
            >
              {node.description}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function TestosteroneCurveVisual() {
  const days = ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"];

  return (
    <div className="glass-card-2026 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500"></div>
          <span className="text-sm text-white/70">Single Weekly Injection</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
          <span className="text-sm text-white/70">Twice Weekly (E3.5D)</span>
        </div>
      </div>

      <div className="relative h-64">
        <svg viewBox="0 0 700 250" className="w-full h-full">
          {[0, 50, 100, 150, 200].map((y) => (
            <line
              key={y}
              x1="50"
              y1={y + 25}
              x2="650"
              y2={y + 25}
              stroke="rgba(255,255,255,0.05)"
              strokeWidth="1"
            />
          ))}

          <motion.path
            d="M 50 200 Q 100 25 150 100 Q 200 175 250 200 Q 300 225 350 200 Q 400 175 450 200 Q 500 225 550 200 Q 600 175 650 200"
            fill="none"
            stroke="rgba(255,149,0,0.5)"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2 }}
          />

          <motion.path
            d="M 50 150 Q 75 75 100 125 Q 125 175 150 150 Q 175 100 200 140 Q 225 180 250 150 Q 275 110 300 145 Q 325 180 350 150 Q 375 110 400 145 Q 425 180 450 150 Q 475 110 500 145 Q 525 180 550 150 Q 575 110 600 145 Q 625 180 650 150"
            fill="none"
            stroke="rgba(16,185,129,0.6)"
            strokeWidth="3"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
          />

          {days.map((day, i) => (
            <text
              key={day}
              x={50 + i * 100}
              y="245"
              fill="rgba(255,255,255,0.5)"
              fontSize="12"
              textAnchor="middle"
            >
              {day}
            </text>
          ))}

          <text
            x="20"
            y="130"
            fill="rgba(255,255,255,0.5)"
            fontSize="12"
            textAnchor="middle"
            transform="rotate(-90 20 130)"
          >
            Testosterone Level
          </text>
        </svg>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-xl bg-white/5">
          <p className="text-2xl font-bold text-amber-400">~800</p>
          <p className="text-sm text-white/50">Peak (24-48h)</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5">
          <p className="text-2xl font-bold text-white">~400</p>
          <p className="text-sm text-white/50">Trough (Day 7)</p>
        </div>
        <div className="p-4 rounded-xl bg-white/5">
          <p className="text-2xl font-bold text-emerald-400">2x</p>
          <p className="text-sm text-white/50">Smoother with E3.5D</p>
        </div>
      </div>
    </div>
  );
}
