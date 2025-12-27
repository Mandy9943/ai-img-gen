const SITE_URL = "https://img-gen.mandy9943.dev/";

export function SeoJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "Bulk AI Image Generator",
        description:
          "Generate multiple images in one run with Google Gemini. Paste a JSON array of prompts, choose variants/aspect ratios, and download results as a ZIP.",
        url: SITE_URL,
        applicationCategory: "MultimediaApplication",
        operatingSystem: "Web",
        image: `${SITE_URL}opengraph-image`,
        author: {
          "@type": "Person",
          name: "Armando Martin (Mandy9943)",
          url: "https://mandy9943.dev",
          sameAs: ["https://github.com/Mandy9943"],
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "What does the variant field do?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "The variant field determines the shape: logo generates square (1:1) images, and banner generates widescreen (16:9) images.",
            },
          },
          {
            "@type": "Question",
            name: "Can I use custom aspect ratios?",
            acceptedAnswer: {
              "@type": "Answer",
              text: 'Yes. You can override the variant by adding an aspectRatio field, e.g. { \"prompt\": \"...\", \"aspectRatio\": \"4:3\" }.',
            },
          },
          {
            "@type": "Question",
            name: "Can I set custom filenames?",
            acceptedAnswer: {
              "@type": "Answer",
              text: 'Yes. Add a filename field, e.g. { \"prompt\": \"...\", \"filename\": \"my-custom-image\" }.',
            },
          },
          {
            "@type": "Question",
            name: "How many images can I generate at once?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "You can submit as many prompts as you want, but the system processes up to 10 images simultaneously for stability.",
            },
          },
          {
            "@type": "Question",
            name: "Where are the images stored?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Images are saved under public/output and appear in the results panel as soon as they are ready.",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}


