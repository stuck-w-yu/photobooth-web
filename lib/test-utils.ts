// lib/test-utils.ts

export interface MBTIQuestion {
  id: number;
  question: string;
  dimension: "E/I" | "S/N" | "T/F" | "J/P";
  optionA: string;
  optionB: string;
}

export const MBTI_TYPES: Record<string, { name: string; description: string }> = {
  ISTJ: { name: "The Inspector", description: "Bertanggung jawab, tulus, analitis, dan pekerja keras yang menyukai keteraturan." },
  ISFJ: { name: "The Protector", description: "Setia, sabar, dan sangat peduli pada perasaan orang lain serta detail praktis." },
  INFJ: { name: "The Counselor", description: "Visioner, idealis, dan memahami motivasi orang lain dengan mendalam." },
  INTJ: { name: "The Mastermind", description: "Pemikir strategis, mandiri, dan memiliki standar kompetensi yang tinggi." },
  ISTP: { name: "The Craftsman", description: "Berani, praktis, dan menguasai segala jenis alat atau instrumen." },
  ISFP: { name: "The Composer", description: "Seniman yang fleksibel, menawan, dan selalu siap menjelajahi hal baru." },
  INFP: { name: "The Healer", description: "Puitis, baik hati, dan selalu ingin membantu tujuan yang baik." },
  INTP: { name: "The Architect", description: "Penemu yang inovatif dengan haus akan pengetahuan yang tak terpadamkan." },
  ESTP: { name: "The Dynamo", description: "Cerdas, berenergi, dan sangat perseptif. Suka hidup di ujung tanduk." },
  ESFP: { name: "The Performer", description: "Spontan, berenergi, dan antusias. Hidup tidak pernah membosankan di sekitar mereka." },
  ENFP: { name: "The Champion", description: "Antusias, kreatif, dan bebas bergaul yang selalu dapat menemukan alasan untuk tersenyum." },
  ENTP: { name: "The Visionary", description: "Pemikir yang cerdas dan penasaran yang tidak bisa menahan tantangan intelektual." },
  ESTJ: { name: "The Supervisor", description: "Administrator yang sangat baik, tak tertandingi dalam mengelola hal-hal atau orang." },
  ESFJ: { name: "The Provider", description: "Sangat peduli, sosial, dan populer, selalu ingin membantu." },
  ENFJ: { name: "The Teacher", description: "Pemimpin yang karismatik dan inspiratif, mampu memikat pendengarnya." },
  ENTJ: { name: "The Commander", description: "Pemimpin yang berani, imajinatif, dan berkemauan keras, selalu menemukan jalan." },
};

// Data Pertanyaan (Contoh sebagian, idealnya ada 60 soal)
const questionsPool: MBTIQuestion[] = [
  { id: 1, dimension: "E/I", question: "Di pesta, Anda biasanya...", optionA: "Berinteraksi dengan banyak orang, termasuk orang asing", optionB: "Berinteraksi hanya dengan beberapa orang yang sudah dikenal" },
  { id: 2, dimension: "S/N", question: "Anda lebih menyukai informasi yang...", optionA: "Konkret dan nyata", optionB: "Abstrak dan teoritis" },
  { id: 3, dimension: "T/F", question: "Dalam mengambil keputusan, Anda lebih dipengaruhi oleh...", optionA: "Logika dan fakta", optionB: "Perasaan dan dampak pada orang lain" },
  { id: 4, dimension: "J/P", question: "Gaya kerja Anda lebih...", optionA: "Terencana dan terorganisir", optionB: "Fleksibel dan spontan" },
  { id: 5, dimension: "E/I", question: "Setelah seharian bekerja, Anda merasa...", optionA: "Perlu bertemu teman untuk mengisi energi", optionB: "Perlu waktu sendiri untuk istirahat" },
  { id: 6, dimension: "S/N", question: "Anda lebih fokus pada...", optionA: "Apa yang sedang terjadi sekarang", optionB: "Apa yang mungkin terjadi di masa depan" },
  { id: 7, dimension: "T/F", question: "Anda lebih menghargai...", optionA: "Kejujuran yang terus terang", optionB: "Harmoni dan empati" },
  { id: 8, dimension: "J/P", question: "Anda lebih suka memiliki...", optionA: "Jadwal yang pasti", optionB: "Opsi yang terbuka" },
  // Tambahkan pertanyaan lain di sini agar cukup untuk di-shuffle
  { id: 9, dimension: "E/I", question: "Anda lebih suka berbicara melalui...", optionA: "Telepon atau tatap muka", optionB: "Pesan teks atau email" },
  { id: 10, dimension: "S/N", question: "Anda lebih mempercayai...", optionA: "Pengalaman langsung", optionB: "Insting dan firasat" },
  { id: 11, dimension: "T/F", question: "Konflik bagi Anda adalah...", optionA: "Sesuatu yang wajar untuk mencari kebenaran", optionB: "Sesuatu yang harus dihindari agar tidak melukai perasaan" },
  { id: 12, dimension: "J/P", question: "Deadline bagi Anda adalah...", optionA: "Waktu mutlak untuk menyelesaikan tugas", optionB: "Perkiraan waktu yang bisa disesuaikan" },
];

export const generateTestSeed = (): string => {
  return Math.random().toString(36).substring(7);
};

export const getRandomMBTIQuestions = (countPerDimension: number = 3): MBTIQuestion[] => {
  // Fungsi sederhana untuk mengambil semua pertanyaan yang ada (mock)
  // Dalam aplikasi nyata, Anda akan memfilter berdasarkan dimensi dan mengacaknya
  // Di sini kita menduplikasi array agar cukup panjang untuk demo jika soal sedikit
  
  let result: MBTIQuestion[] = [];
  const dimensions = ["E/I", "S/N", "T/F", "J/P"];
  
  dimensions.forEach(dim => {
     const dimQuestions = questionsPool.filter(q => q.dimension === dim);
     // Ambil pertanyaan sesuai jumlah atau ulangi jika kurang (untuk demo)
     for(let i=0; i<countPerDimension; i++) {
        if (dimQuestions[i % dimQuestions.length]) {
            result.push(dimQuestions[i % dimQuestions.length]);
        }
     }
  });

  return result.sort(() => Math.random() - 0.5);
};

export interface IQQuestion {
  id: number;
  type: 'math' | 'logic' | 'pattern' | 'series' | 'verbal' | 'spatial' | 'reasoning';
  question: string;
  options: string[];
  correct: number; // Index dari jawaban benar (0-3)
  explanation: string;
}

const iqQuestionsPool: IQQuestion[] = [
  {
    id: 1,
    type: 'series',
    question: "Angka berapa yang melanjutkan seri ini: 2, 4, 8, 16, ...",
    options: ["24", "30", "32", "64"],
    correct: 2,
    explanation: "Setiap angka dikalikan 2. Jadi 16 x 2 = 32."
  },
  {
    id: 2,
    type: 'logic',
    question: "Jika beberapa Smaugs adalah Thors dan beberapa Thors adalah Thrains, maka...",
    options: ["Beberapa Smaugs pasti Thrains", "Semua Thors adalah Smaugs", "Tidak dapat disimpulkan", "Semua Thrains adalah Thors"],
    correct: 2,
    explanation: "Ini adalah silogisme. Tidak ada hubungan langsung yang pasti antara Smaugs dan Thrains berdasarkan premis yang diberikan."
  },
  {
    id: 3,
    type: 'math',
    question: "Berapa 15% dari 200?",
    options: ["20", "25", "30", "35"],
    correct: 2,
    explanation: "10% dari 200 adalah 20. 5% adalah 10. Jadi 15% adalah 20 + 10 = 30."
  },
  {
    id: 4,
    type: 'pattern',
    question: "Manakah yang tidak termasuk dalam kelompok?",
    options: ["Kucing", "Anjing", "Hamster", "Hiu"],
    correct: 3,
    explanation: "Hiu hidup di air (pisces), sementara yang lain adalah mamalia darat."
  },
  {
    id: 5,
    type: 'series',
    question: "1, 1, 2, 3, 5, 8, ... Angka selanjutnya adalah?",
    options: ["11", "12", "13", "15"],
    correct: 2,
    explanation: "Deret Fibonacci. Angka berikutnya adalah penjumlahan dua angka sebelumnya (5 + 8 = 13)."
  },
  {
    id: 6,
    type: 'verbal',
    question: "Lawan kata dari 'ABSTRAK' adalah...",
    options: ["Asing", "Konkret", "Aneh", "Maya"],
    correct: 1,
    explanation: "Abstrak berarti tidak berwujud, Konkret berarti nyata/berwujud."
  },
  {
    id: 7,
    type: 'spatial',
    question: "Jika sebuah dadu diputar dua kali ke kanan, sisi mana yang berlawanan dengan sisi atas awal?",
    options: ["Sisi bawah", "Sisi kiri", "Sisi kanan", "Sisi belakang"],
    correct: 0,
    explanation: "Sisi yang berlawanan dengan sisi atas selalu sisi bawah, tidak peduli bagaimana orientasinya, kecuali pertanyaan menanyakan posisi relatif baru."
  },
  {
    id: 8,
    type: 'math',
    question: "Jika 5 mesin membuat 5 alat dalam 5 menit, berapa lama 100 mesin membuat 100 alat?",
    options: ["100 menit", "5 menit", "50 menit", "20 menit"],
    correct: 1,
    explanation: "Setiap mesin membutuhkan 5 menit untuk membuat 1 alat. Jadi 100 mesin juga butuh 5 menit untuk membuat masing-masing 1 alat (total 100 alat)."
  },
  {
    id: 9,
    type: 'logic',
    question: "Mana yang lebih berat: 1 kg kapas atau 1 kg besi?",
    options: ["Kapas", "Besi", "Sama berat", "Tergantung volume"],
    correct: 2,
    explanation: "Keduanya memiliki massa yang sama yaitu 1 kg."
  },
  {
    id: 10,
    type: 'series',
    question: "A, C, E, G, ... Huruf selanjutnya?",
    options: ["H", "I", "J", "K"],
    correct: 1,
    explanation: "Pola melompati satu huruf. A (b) C (d) E (f) G (h) I."
  },
  {
    id: 11,
    type: 'math',
    question: "Berapa setengah dari seperempat dari 800?",
    options: ["200", "100", "50", "400"],
    correct: 1,
    explanation: "Seperempat dari 800 adalah 200. Setengah dari 200 adalah 100."
  },
  {
    id: 12,
    type: 'verbal',
    question: "Analogi -> API : PANAS :: ES : ...",
    options: ["CAIR", "DINGIN", "BEKU", "KUTUB"],
    correct: 1,
    explanation: "Api sifatnya panas, Es sifatnya dingin."
  }
];

export const getRandomIQQuestions = (count: number = 10): IQQuestion[] => {
  // Mengacak array (Fisher-Yates Shuffle sederhana)
  const shuffled = [...iqQuestionsPool].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};