import styles from './WeatherFAQ.module.css';

interface WeatherData {
  summary: {
    headline: string;
    today: string;
    tomorrow: string;
    weekend: string;
    bestDay: string | null;
  };
  current: {
    temperature: number;
  };
  daily: Array<{
    date: string;
    temperatureMax: number;
    temperatureMin: number;
    precipitationProbability: number;
  }>;
}

interface WeatherFAQProps {
  locationName: string;
  weather: WeatherData;
}

interface FAQItem {
  question: string;
  answer: string;
}

export function WeatherFAQ({ locationName, weather }: WeatherFAQProps) {
  const faqs = generateFAQs(locationName, weather);

  return (
    <>
      <FAQStructuredData faqs={faqs} />
      <section className={styles.section}>
        <h2 className={styles.title}>Frequently asked questions</h2>
        <dl className={styles.list}>
          {faqs.map((faq, index) => (
            <div key={index} className={styles.item}>
              <dt className={styles.question}>{faq.question}</dt>
              <dd className={styles.answer}>{faq.answer}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}

function FAQStructuredData({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

function generateFAQs(locationName: string, weather: WeatherData): FAQItem[] {
  const today = weather.daily[0];
  const tomorrow = weather.daily[1];
  const rainToday = today?.precipitationProbability > 40;
  const rainTomorrow = tomorrow?.precipitationProbability > 40;

  const faqs: FAQItem[] = [
    {
      question: `Do I need an umbrella in ${locationName} today?`,
      answer: rainToday
        ? `Yes, there's a ${today.precipitationProbability}% chance of rain in ${locationName} today. ${weather.summary.today}`
        : `No, you probably won't need an umbrella in ${locationName} today. ${weather.summary.today}`,
    },
    {
      question: `What is the weather like in ${locationName} today?`,
      answer: `${weather.summary.today} The temperature in ${locationName} is currently ${Math.round(weather.current.temperature)}°C, with a high of ${Math.round(today?.temperatureMax || 0)}°C and a low of ${Math.round(today?.temperatureMin || 0)}°C.`,
    },
    {
      question: `What will the weather be like in ${locationName} tomorrow?`,
      answer: `${weather.summary.tomorrow} Tomorrow's temperature in ${locationName} will range from ${Math.round(tomorrow?.temperatureMin || 0)}°C to ${Math.round(tomorrow?.temperatureMax || 0)}°C${rainTomorrow ? `, with a ${tomorrow.precipitationProbability}% chance of rain` : ''}.`,
    },
  ];

  if (weather.summary.weekend) {
    faqs.push({
      question: `What is the weekend weather forecast for ${locationName}?`,
      answer: weather.summary.weekend,
    });
  }

  if (weather.summary.bestDay) {
    faqs.push({
      question: `What is the best day this week in ${locationName}?`,
      answer: weather.summary.bestDay,
    });
  }

  return faqs;
}
