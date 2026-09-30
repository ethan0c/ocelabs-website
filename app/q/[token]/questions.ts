/** The 16 questions from docs/client-onboarding.txt, Part 1, in their groups. Ids are stored with the answers; keep them stable. */
export type Question = { id: string; text: string };
export type QuestionGroup = { title: string; items: Question[] };

export const QUESTIONS: QuestionGroup[] = [
  {
    title: 'About you',
    items: [
      { id: 'q1', text: 'What does your business do? One or two sentences is plenty.' },
      { id: 'q2', text: 'Who are your customers, and how do they usually find you?' },
      { id: 'q3', text: 'What do you want people to do after visiting the site? For example: call you, book an appointment, buy something, or fill in a form.' },
    ],
  },
  {
    title: 'The site',
    items: [
      { id: 'q4', text: 'Do you have a website now? If so, what do you like about it and what bugs you?' },
      { id: 'q5', text: 'Which pages do you want? Most sites have Home, About, Services and Contact. Add anything else you have in mind.' },
      { id: 'q6', text: 'Is the text for the site written yet, or will you need help with it?' },
      { id: 'q7', text: 'Do you have a logo, brand colours or photos we should use?' },
      { id: 'q8', text: 'Name two or three websites you like and what you like about them. They can be from any industry.' },
    ],
  },
  {
    title: 'Being found',
    items: [
      { id: 'q9', text: 'What would someone type into Google to find a business like yours?' },
      { id: 'q10', text: 'Where are your customers? A town, a region, the whole country?' },
      { id: 'q11', text: 'Do you have a Google Business listing (the box that shows up on Google Maps) or a mailing list we should keep in mind?' },
    ],
  },
  {
    title: 'Practical',
    items: [
      { id: 'q12', text: 'Do you already own a web address (like yourbusiness.com)? Which one, and who did you buy it through?' },
      { id: 'q13', text: 'Does the site need to do anything beyond showing information? For example: take bookings, take payments, sign people up to a newsletter, or have a blog.' },
      { id: 'q14', text: 'Who has the final say on the site?' },
      { id: 'q15', text: 'After launch, who will keep the site up to date, and how often do you expect changes?' },
      { id: 'q16', text: 'Is there a date you need the site live by? If you have a budget in mind, let us know that too.' },
    ],
  },
];
