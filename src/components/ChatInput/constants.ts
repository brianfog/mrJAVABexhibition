  // Question type options
 export  const questionTypeOptions = [
    { value: 'problem-solver', label: 'حل مسائل' },
    { value: 'pdf-helper', label: 'همیار مقاله/ PDF', locked: true },
    { value: 'quiz-maker', label: 'طراحی نمونه سئوال' },
    { value: 'book-chat', label: 'چت با کتاب' },
    { value: 'summarizer', label: 'خلاصه سازی' },
    { value: 'learning', label: 'آموزش'},
    { value: 'contest', label: 'مسابقه', locked: true, exclusiveLock: true},
  ];

  // Answer mode options
 export  const answerModeOptions = [
    {
      value: 'quick',
      title: 'مدل سریع',
      description: 'پاسخ سریع تر مناسب سئوالات روزمره (12نت7ثانیه)',
    },
    {
      value: 'strong',
      title: 'مدل قوی',
      description: 'برای پاسخ های نیازمند به استدلال بالا (35 تا 50ثانیه)',
      locked: true,
    },
  ];