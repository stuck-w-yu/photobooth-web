"use client";

import { useState, useEffect } from "react";
import {
  getRandomIQQuestions,
  generateTestSeed,
  type IQQuestion,
} from "@/lib/test-utils";

interface IQTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IQTestResult {
  score: number;
  iqEstimate: number;
  answers: number[];
}

export default function IQTestModal({ isOpen, onClose }: IQTestModalProps) {
  const [iqQuestions, setIqQuestions] = useState<IQQuestion[]>([]);
  const [testSeed, setTestSeed] = useState<string>("");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    (number | undefined)[]
  >([]);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<IQTestResult | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // ========== Initialize random questions when modal opens ==========
  useEffect(() => {
    if (isOpen && iqQuestions.length === 0) {
      const seed = generateTestSeed();
      const randomQuestions = getRandomIQQuestions(10); // Get 10 random questions

      setTestSeed(seed);
      setIqQuestions(randomQuestions);
    }
  }, [isOpen, iqQuestions.length]);

  // ========= Reset test =========
  const resetTest = () => {
    setCurrentQuestion(0);
    setSelectedAnswers([]);
    setShowResults(false);
    setTestResult(null);
    setStartTime(new Date());

    // Generate new random questions for new test
    const seed = generateTestSeed();
    const newRandomQuestions = getRandomIQQuestions(10);

    setTestSeed(seed);
    setIqQuestions(newRandomQuestions);
  };

  // ========= Start test function =========
  const startTest = () => {
    resetTest();
  };

  // ========= Handle answer selection =========
  const handleAnswerSelect = (answerIndex: number) => {
    if (!startTime) setStartTime(new Date());

    // Ensure array has enough space
    const newAnswers = [...selectedAnswers];
    // Resize array if needed
    while (newAnswers.length <= currentQuestion) {
      newAnswers.push(undefined);
    }
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);

    // Auto advance menggunakan functional state updates untuk menghindari race condition
    const isLastQuestion = currentQuestion >= iqQuestions.length - 1;

    setTimeout(() => {
      if (!isLastQuestion) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        // Finish test - get latest answers state
        setSelectedAnswers((currentAnswers) => {
          const finalAnswers = [...currentAnswers];
          // Fill any empty slots with 0
          for (let i = 0; i < iqQuestions.length; i++) {
            if (finalAnswers[i] === undefined) {
              finalAnswers[i] = 0; // Default fallback
            }
          }

          calculateResults(finalAnswers);
          return currentAnswers;
        });
      }
    }, 1000);
  };

  // ========= Navigate between questions =========
  const goToQuestion = (index: number) => {
    if (index >= 0 && index < iqQuestions.length) {
      setCurrentQuestion(index);
    }
  };

  // ========= Calculate IQ results =========
  const calculateResults = (answers: (number | undefined)[]) => {
    // Starting IQ calculation

    // ========== Safety checks ==========
    if (!Array.isArray(iqQuestions) || iqQuestions.length === 0) {
      return;
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return;
    }

    let correct = 0;
    let processedQuestions = 0;
    const unansweredQuestions: number[] = [];

    // Process answers with detailed logging
    answers.forEach((answer, index) => {
      // Validate question exists (essential error check)
      if (!iqQuestions[index]) {
        return;
      }

      // Handle undefined answers (unanswered questions)
      if (answer === undefined) {
        unansweredQuestions.push(index);
        return;
      }

      processedQuestions++;

      // Validate correct answer exists
      const correctAnswer = iqQuestions[index].correct;
      if (typeof correctAnswer !== "number") {
        return;
      }

      const isAnswerCorrect = answer === correctAnswer;
      if (isAnswerCorrect) {
        correct++;
      }
    });

    // Calculate percentage and IQ using proper formula
    const percentage =
      processedQuestions > 0 ? (correct / processedQuestions) * 100 : 0;
    const iqEstimate = Math.max(70, Math.round(70 + percentage * 0.6)); // Minimum IQ 70

    // Create clean answers array (undefineds become 0 for display)
    const cleanAnswers = answers.map((answer) =>
      answer === undefined ? 0 : answer
    );

    const result: IQTestResult = {
      score: correct,
      iqEstimate: iqEstimate,
      answers: cleanAnswers,
    };

    setTestResult(result);
    setShowResults(true);
  };

  // ========= Finish early =========
  const finishTest = () => {
    if (selectedAnswers.length === iqQuestions.length) {
      // Make sure current question answer is included if user just answered it
      const finalAnswers = [...selectedAnswers];
      if (
        currentQuestion < iqQuestions.length &&
        selectedAnswers[currentQuestion] === undefined
      ) {
        finalAnswers[currentQuestion] = selectedAnswers[currentQuestion] || 0; // fallback
      }
      calculateResults(finalAnswers);
    }
  };

  // ========= Get category icon =========
  const getCategoryIcon = (type: string) => {
    switch (type) {
      case "math":
        return "🧮";
      case "logic":
        return "🧠";
      case "pattern":
        return "🔄";
      case "spatial":
        return "📐";
      case "reasoning":
        return "💡";
      case "verbal":
        return "📝";
      case "series":
        return "🔢";
      default:
        return "❓";
    }
  };

  // ========= Get IQ interpretation =========
  const getIQInterpretation = (iq: number) => {
    if (iq < 70)
      return {
        level: "Di bawah rata-rata",
        desc: "Perlu dukungan tambahan dalam pembelajaran",
      };
    if (iq < 90)
      return {
        level: "Rata-rata",
        desc: "Kemampuan intelektual dalam kisaran normal",
      };
    if (iq < 110)
      return {
        level: "Di atas rata-rata",
        desc: "Kemampuan intelektual yang baik",
      };
    if (iq < 130)
      return {
        level: "Superior",
        desc: "Kemampuan intelektual yang sangat baik",
      };
    return { level: "Istimewa", desc: "Kemampuan intelektual luar biasa" };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center ">
      {/* ========= Overlay ========= */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* ========= Modal ========= */}
      <div className="relative glass rounded-3xl p-6 shadow-2xl max-w-4xl mx-4 w-full max-h-[90vh] overflow-y-auto bg-gray-900">
        {/* ========= Header ========= */}
        <div className="flex items-center justify-between mb-6 ">
          <h2 className="text-2xl font-bold gradient-text text-amber-50">
            Tes IQ Professional
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
          <div className="space-y-6">
            {/* ========= Progress and navigation ========= */}
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-400">
                Pertanyaan {currentQuestion + 1} dari {iqQuestions.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => goToQuestion(currentQuestion - 1)}
                  disabled={currentQuestion === 0}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed rounded text-sm transition-colors"
                >
                  ←
                </button>
                <div className="flex gap-1">
                  {iqQuestions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                        index < selectedAnswers.length
                          ? "bg-green-500 hover:bg-green-400"
                          : index === currentQuestion
                          ? "bg-purple-500"
                          : "bg-gray-600 hover:bg-gray-500"
                      }`}
                    >
                      {index < selectedAnswers.length ? "✓" : index + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => goToQuestion(currentQuestion + 1)}
                  disabled={currentQuestion >= iqQuestions.length - 1}
                  className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-800 disabled:cursor-not-allowed rounded text-sm transition-colors"
                >
                  →
                </button>
              </div>
            </div>

            {/* ========= Progress bar ========= */}
            <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestion + 1) / iqQuestions.length) * 100
                  }%`,
                }}
              ></div>
            </div>

            {/* ========= Current Question ========= */}
            {iqQuestions[currentQuestion] && (
              <div className="bg-black/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">
                    {getCategoryIcon(iqQuestions[currentQuestion].type)}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {iqQuestions[currentQuestion].question}
                    </h3>
                    <span className="inline-block px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs capitalize">
                      {iqQuestions[currentQuestion].type}
                    </span>
                  </div>
                </div>

                {/* ========= Options ========= */}
                <div className="grid grid-cols-1 gap-3">
                  {iqQuestions[currentQuestion].options.map(
                    (option: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={
                          selectedAnswers[currentQuestion] !== undefined
                        }
                        className={`p-4 rounded-xl text-left transition-all duration-200 ${
                          selectedAnswers[currentQuestion] === index
                            ? selectedAnswers[currentQuestion] ===
                              iqQuestions[currentQuestion].correct
                              ? "bg-green-500/20 border-2 border-green-500"
                              : "bg-red-500/20 border-2 border-red-500"
                            : selectedAnswers[currentQuestion] !== undefined &&
                              index === iqQuestions[currentQuestion].correct
                            ? "bg-green-500/20 border-2 border-green-500"
                            : !selectedAnswers[currentQuestion]
                            ? "bg-white/10 hover:bg-white/20 border-2 border-gray-600 hover:border-purple-400"
                            : "bg-gray-700/50 border-2 border-gray-600 cursor-not-allowed"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              selectedAnswers[currentQuestion] === index
                                ? "border-white bg-white"
                                : "border-gray-400"
                            }`}
                          >
                            {selectedAnswers[currentQuestion] === index && (
                              <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                            )}
                          </div>
                          <span
                            className={`text-sm ${
                              selectedAnswers[currentQuestion] === index
                                ? "text-white font-medium"
                                : "text-gray-300"
                            }`}
                          >
                            {option}
                          </span>
                        </div>
                      </button>
                    )
                  )}
                </div>

                {/* ========= Show explanation if answered ========= */}
                {selectedAnswers[currentQuestion] !== undefined && (
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <h4 className="text-blue-300 font-medium mb-2">
                      Penjelasan:
                    </h4>
                    <p className="text-blue-200 text-sm">
                      {iqQuestions[currentQuestion].explanation}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* ========= Finish test button ========= */}
            {selectedAnswers.length === iqQuestions.length && (
              <div className="text-center">
                <button onClick={finishTest} className="btn-primary px-8 py-3">
                  Lihat Hasil Tes
                </button>
              </div>
            )}
          </div>
        ) : testResult ? (
          // ========= Results interface =========
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold text-white">
                  {testResult.iqEstimate}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                IQ Score: {testResult.iqEstimate}
              </h3>
              <p className="text-gray-400 mb-6">
                {testResult.score} dari {iqQuestions.length} pertanyaan benar
              </p>
            </div>

            {/* ========= IQ Interpretation ========= */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl p-6 border border-purple-500/20">
              <h4 className="text-white font-semibold mb-3">
                Interpretasi Hasil:
              </h4>
              <div className="space-y-2">
                <p className="text-purple-200">
                  <strong className="text-white">
                    {getIQInterpretation(testResult.iqEstimate).level}
                  </strong>
                </p>
                <p className="text-purple-300 text-sm">
                  {getIQInterpretation(testResult.iqEstimate).desc}
                </p>
              </div>
            </div>

            {/* ========= Detailed Results ========= */}
            <div className="space-y-4">
              <h4 className="text-white font-semibold">Detail Jawaban:</h4>
              <div className="grid gap-3 max-h-60 overflow-y-auto">
                {iqQuestions.map((question, index) => (
                  <div key={index} className="bg-black/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          testResult.answers[index] === question.correct
                            ? "bg-green-500 text-white"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        {testResult.answers[index] === question.correct
                          ? "✓"
                          : "✗"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-300 truncate">
                          {question.question}
                        </p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            Jawaban Anda:
                          </span>
                          <span
                            className={`text-xs ${
                              testResult.answers[index] === question.correct
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {question.options[testResult.answers[index]]}
                          </span>
                          {testResult.answers[index] !== question.correct && (
                            <>
                              <span className="text-xs text-gray-500">
                                • Benar:
                              </span>
                              <span className="text-xs text-green-400">
                                {question.options[question.correct]}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
              Tes IQ Professional
            </h3>
            <p className="text-gray-300 max-w-md mx-auto">
              Tes ini terdiri dari {iqQuestions.length} pertanyaan yang
              dirancang untuk mengukur kemampuan intelektual Anda dalam berbagai
              aspek: matematika, logika, pola berpikir, dan penalaran verbal.
            </p>

            <div className="bg-black/20 rounded-xl p-4 max-w-md mx-auto">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">
                  Jumlah Pertanyaan:
                </span>
                <span className="text-sm font-medium text-white">
                  {iqQuestions.length}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-300">Waktu Estimasi:</span>
                <span className="text-sm font-medium text-white">
                  10-15 menit
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">
                  Tingkat Kesulitan:
                </span>
                <span className="text-sm font-medium text-green-400">
                  Sedang
                </span>
              </div>
            </div>

            <button onClick={startTest} className="btn-primary px-8 py-3">
              Mulai Tes IQ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
