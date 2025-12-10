"use client";

import { useState, useEffect } from "react";
import {
  getRandomMBTIQuestions,
  generateTestSeed,
  type MBTIQuestion,
} from "../lib/test-utils";

interface MBTITestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface MBTIResult {
  personalityType: string;
  scores: {
    E: number;
    I: number;
    S: number;
    N: number;
    T: number;
    F: number;
    J: number;
    P: number;
  };
  completedAt: Date;
}

import { MBTI_TYPES } from "../lib/test-utils";

export default function MBTITestModal({ isOpen, onClose }: MBTITestModalProps) {
  const [mbtiQuestions, setMbtiQuestions] = useState<MBTIQuestion[]>([]);
  const [testSeed, setTestSeed] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [mbtiResult, setMbtiResult] = useState<MBTIResult | null>(null);
  const [populationPercentage] = useState(() => Math.floor(Math.random() * 10) + 5);

  // ========== Initialize random questions when modal opens ==========
  useEffect(() => {
    if (isOpen && mbtiQuestions.length === 0) {
      const seed = generateTestSeed();
      const randomQuestions = getRandomMBTIQuestions(15); // Get 15 questions per dimension (60 total)

      setTestSeed(seed);
      setMbtiQuestions(randomQuestions);

      // Initialize MBTI test without console logs
    }
  }, [isOpen, mbtiQuestions.length]);

  // ========= Reset test =========
  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
    setMbtiResult(null);

    // Generate new random questions for new test
    const seed = generateTestSeed();
    const newRandomQuestions = getRandomMBTIQuestions(15);

    setTestSeed(seed);
    setMbtiQuestions(newRandomQuestions);

    // Reset test without console logs
  };

  // ========= Start test function =========
  const startTest = () => {
    resetTest();
  };

  // ========= Handle answer selection =========
  const handleAnswerSelect = (choice: "A" | "B") => {
    const question = mbtiQuestions[currentQuestion];
    const answerValue = choice === "A" ? 1 : -1;

    const newAnswers = { ...answers };
    if (!newAnswers[question.dimension]) {
      newAnswers[question.dimension] = [];
    }
    newAnswers[question.dimension][currentQuestion] = answerValue;

    setAnswers(newAnswers);

    // Auto advance to next question
    setTimeout(() => {
      if (currentQuestion < mbtiQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        calculateMBTIResult(newAnswers);
      }
    }, 800);
  };

  // ========= Calculate MBTI result =========
  const calculateMBTIResult = (userAnswers: Record<string, number[]>) => {
    const scores = {
      E: 0,
      I: 0, // Extroversion/Introversion
      S: 0,
      N: 0, // Sensing/Intuition
      T: 0,
      F: 0, // Thinking/Feeling
      J: 0,
      P: 0, // Judging/Perceiving
    };

    // Count answers for each dimension
    mbtiQuestions.forEach((question, index) => {
      const answer = userAnswers[question.dimension]?.[index];
      if (answer !== undefined) {
        if (question.dimension === "E/I") {
          if (answer > 0) scores.E++;
          else scores.I++;
        } else if (question.dimension === "S/N") {
          if (answer > 0) scores.S++;
          else scores.N++;
        } else if (question.dimension === "T/F") {
          if (answer > 0) scores.T++;
          else scores.F++;
        } else if (question.dimension === "J/P") {
          if (answer > 0) scores.J++;
          else scores.P++;
        }
      }
    });

    // Determine personality type
    const personalityType =
      (scores.E > scores.I ? "E" : "I") +
      (scores.S > scores.N ? "S" : "N") +
      (scores.T > scores.F ? "T" : "F") +
      (scores.J > scores.P ? "J" : "P");

    const result: MBTIResult = {
      personalityType,
      scores,
      completedAt: new Date(),
    };

    setMbtiResult(result);
    setShowResults(true);
  };

  // ========= Get progress percentage =========
  const getProgress = () => {
    return ((currentQuestion + 1) / mbtiQuestions.length) * 100;
  };

  // ========= Get questions answered count =========
  const getAnsweredCount = () => {
    return Object.values(answers).reduce((total, dimensionAnswers) => {
      return (
        total + dimensionAnswers.filter((answer) => answer !== undefined).length
      );
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* ========= Overlay ========= */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* ========= Modal ========= */}
      <div className="relative glass rounded-3xl p-6 bg-gray-900 shadow-2xl max-w-4xl mx-4 w-full max-h-[90vh] overflow-y-auto">
        {/* ========= Header ========= */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold gradient-text text-amber-50">
            Tes MBTI Kepribadian
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 transition-colors flex items-center justify-center"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {!showResults ? (
          // ========= Test interface =========
          <div className="space-y-6 bg-gray-900">
            {/* ========= Progress ========= */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  Pertanyaan {currentQuestion + 1} dari {mbtiQuestions.length}
                </span>
                <span className="text-sm text-gray-400">
                  {getAnsweredCount()} jawaban tercatat
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${getProgress()}%` }}
                ></div>
              </div>
            </div>

            {/* ========= Current Question ========= */}
            {mbtiQuestions[currentQuestion] && (
              <div className="bg-black/20 rounded-2xl p-8">
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="text-2xl">💭</span>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                    {mbtiQuestions[currentQuestion].dimension}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white text-center mb-8 leading-relaxed">
                  {mbtiQuestions[currentQuestion].question}
                </h3>

                {/* ========= Answer options ========= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleAnswerSelect("A")}
                    className="group p-6 bg-green-500/10 hover:bg-green-500/20 border-2 border-green-500/30 hover:border-green-500/60 rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform text-green-300">
                        A
                      </div>
                      <p className="text-green-300 group-hover:text-green-200 text-sm leading-relaxed">
                        {mbtiQuestions[currentQuestion].optionA}
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleAnswerSelect("B")}
                    className="group p-6 bg-blue-500/10 hover:bg-blue-500/20 border-2 border-blue-500/30 hover:border-blue-500/60 rounded-xl transition-all duration-200 hover:scale-105"
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform text-blue-300">
                        B
                      </div>
                      <p className="text-blue-300 group-hover:text-blue-200 text-sm leading-relaxed">
                        {mbtiQuestions[currentQuestion].optionB}
                      </p>
                    </div>
                  </button>
                </div>

                {/* ========= Instructions ========= */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-400">
                    Pilih jawaban yang paling mendekati bagaimana Anda biasanya
                    berpikir dan bertindak
                  </p>
                </div>
              </div>
            )}

            {/* ========= Quick stats ========= */}
            <div className="bg-black/10 rounded-xl p-4">
              <h4 className="text-sm font-medium text-white mb-3">
                Jawaban per Dimensi:
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["E/I", "S/N", "T/F", "J/P"].map((dimension) => (
                  <div key={dimension} className="text-center">
                    <div className="text-lg font-bold text-purple-300">
                      {dimension}
                    </div>
                    <div className="text-sm text-gray-400">
                      {answers[dimension]?.filter((a) => a !== undefined)
                        .length || 0}{" "}
                      /{" "}
                      {
                        mbtiQuestions.filter((q) => q.dimension === dimension)
                          .length
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : mbtiResult &&
          MBTI_TYPES[mbtiResult.personalityType as keyof typeof MBTI_TYPES] ? (
          // ========= Results interface =========
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {mbtiResult.personalityType}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {
                  MBTI_TYPES[
                    mbtiResult.personalityType as keyof typeof MBTI_TYPES
                  ].name
                }
              </h3>
              <p className="text-gray-300 mb-6">
                {
                  MBTI_TYPES[
                    mbtiResult.personalityType as keyof typeof MBTI_TYPES
                  ].description
                }
              </p>
            </div>

            {/* ========= Dimension Scores ========= */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/20">
              <h4 className="text-white font-semibold mb-4 text-center">
                Skor Dimensi Anda:
              </h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-300">Extroversion (E)</span>
                    <span className="text-white">
                      {mbtiResult.scores.E} vs Introversion (I){" "}
                      {mbtiResult.scores.I}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (mbtiResult.scores.E /
                            (mbtiResult.scores.E + mbtiResult.scores.I)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-300">Sensing (S)</span>
                    <span className="text-white">
                      {mbtiResult.scores.S} vs Intuition (N){" "}
                      {mbtiResult.scores.N}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-pink-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (mbtiResult.scores.S /
                            (mbtiResult.scores.S + mbtiResult.scores.N)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-300">Thinking (T)</span>
                    <span className="text-white">
                      {mbtiResult.scores.T} vs Feeling (F) {mbtiResult.scores.F}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (mbtiResult.scores.T /
                            (mbtiResult.scores.T + mbtiResult.scores.F)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-purple-300">Judging (J)</span>
                    <span className="text-white">
                      {mbtiResult.scores.J} vs Perceiving (P){" "}
                      {mbtiResult.scores.P}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${
                          (mbtiResult.scores.J /
                            (mbtiResult.scores.J + mbtiResult.scores.P)) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========= Personality Description ========= */}
            <div className="bg-black/20 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-4">
                Tentang Tipe Kepribadian Anda:
              </h4>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">•</span>
                  <p>
                    <strong>
                      Sebagai{" "}
                      {
                        MBTI_TYPES[
                          mbtiResult.personalityType as keyof typeof MBTI_TYPES
                        ].name
                      }
                    </strong>
                    , Anda memiliki kekuatan unik dalam area tertentu.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">•</span>
                  <p>
                    Tipe kepribadian ini mewakili kurang dari{" "}
                    {populationPercentage}% populasi dunia.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">•</span>
                  <p>
                    MBTI bukanlah label yang membatasi, melainkan alat untuk
                    memahami cara kerja pikiran Anda.
                  </p>
                </div>
              </div>
            </div>

            {/* ========= Action buttons ========= */}
            <div className="flex gap-4 justify-center">
              <button onClick={resetTest} className="btn-secondary px-6 py-2">
                Tes Lagi
              </button>
              <button onClick={onClose} className="btn-primary px-6 py-2">
                Tutup
              </button>
            </div>
          </div>
        ) : (
          // ========= Welcome screen =========
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">🧠</span>
            </div>
            <h3 className="text-2xl font-bold text-white">
              Tes Kepribadian MBTI
            </h3>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Myers-Briggs Type Indicator (MBTI) adalah tes kepribadian yang
              akan membantu Anda memahami bagaimana Anda berinteraksi dengan
              dunia, cara Anda memproses informasi, dan bagaimana Anda membuat
              keputusan dalam kehidupan sehari-hari.
            </p>

            <div className="bg-black/20 rounded-xl p-6 max-w-md mx-auto">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">
                    Jumlah Pertanyaan:
                  </span>
                  <span className="text-sm font-medium text-white">
                    {mbtiQuestions.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">Waktu Estimasi:</span>
                  <span className="text-sm font-medium text-white">
                    15-20 menit
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">
                    16 Tipe Kepribadian:
                  </span>
                  <span className="text-sm font-medium text-green-400">
                    Berbasis Ilmiah
                  </span>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <div className="text-left">
                    <h5 className="text-sm font-medium text-white mb-3">
                      4 Dimensi Utama:
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-purple-500/10 text-purple-300 p-2 rounded">
                        E/I: Ekstrovert/Introvert
                      </div>
                      <div className="bg-pink-500/10 text-pink-300 p-2 rounded">
                        S/N: Sensing/iNtuiting
                      </div>
                      <div className="bg-green-500/10 text-green-300 p-2 rounded">
                        T/F: Thinking/Feeling
                      </div>
                      <div className="bg-yellow-500/10 text-yellow-300 p-2 rounded">
                        J/P: Judging/Perceiving
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-400 mb-4">
                Tes ini bersifat indikatif dan bukan diagnosis psikologis
                profesional
              </p>
              <button onClick={startTest} className="btn-primary px-8 py-3">
                Mulai Tes MBTI
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
