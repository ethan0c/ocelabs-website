/** The 16 questions from docs/client-onboarding.txt, Part 1, in their groups. */
export type Question = { id: string; text: string };
export type QuestionGroup = { title: string; items: Question[] };

export const QUESTIONS: QuestionGroup[] = [
  {
    title: 'About you',
    items: [
      { id: 'q1', text: 'What does your business do, in one or two sentences?' },
      { id: 'q2', text: 'Who is the site for? Describe your ideal visitor: who they are, what they need, and how they usually find businesses like yours.' },
      { id: 'q3', text: 'What should a visitor do after reading the site? For example: email you, book a call, buy something, download the app, follow you on social media.' },
    ],
  },
  {
    title: 'The site',
    items: [
      { id: 'q4', text: 'Do you have an existing site? If so, what works about it and what does not?' },
      { id: 'q5', text: 'Which pages do you need? Typical choices are Home, About, Services or Work, Pricing, and Contact. List anything else you have in mind.' },
      { id: 'q6', text: 'Is the written content ready, or do you need help writing it?' },
      { id: 'q7', text: 'Do you have a logo, brand colours, fonts, or photography we should use? If not, we can create them.' },
      { id: 'q8', text: 'Share two or three websites you like, and say what you like about each one. They do not have to be in your industry.' },
    ],
  },
  {
    title: 'Search',
    items: [
      { id: 'q9', text: 'What would someone type into Google to find you? List a few phrases.' },
      { id: 'q10', text: 'Do you serve a specific city, region, or country?' },
      { id: 'q11', text: 'Do you already have a Google Business Profile, existing search rankings, or a newsletter list we should protect during the move?' },
    ],
  },
  {
    title: 'Practical',
    items: [
      { id: 'q12', text: 'Do you own a domain name? Which one, and where is it registered?' },
      { id: 'q13', text: 'Do you need anything beyond pages? For example: a contact form, appointment booking, a newsletter, online payments, a customer login, or a blog.' },
      { id: 'q14', text: 'Who gives final approval on the project?' },
      { id: 'q15', text: 'After launch, who will update the content, and roughly how often?' },
      { id: 'q16', text: 'When do you need the site live? Is there a budget range you are working within?' },
    ],
  },
];
