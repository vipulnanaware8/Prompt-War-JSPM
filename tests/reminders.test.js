import { describe, expect, it } from 'vitest';
import { buildReminder } from '../src/lib/reminders.js';
import { displayName } from '../src/lib/format.js';

const ramesh = { name: 'Ramesh Patil', aliases: ['ramesh', 'रमेश', 'patil'], balance: 340 };

describe('reminders (SRS 7.8)', () => {
  it('Hinglish', () => {
    expect(buildReminder('hinglish', ramesh, 'Sharma General Store')).toBe(
      'Namaste Ramesh ji, Sharma General Store mein aapka 340 rupaye ka hisaab baaki hai. Suvidha ho to kripya chuka dijiye. Dhanyavaad!',
    );
  });

  it('Hindi and Marathi use the Devanagari name', () => {
    expect(buildReminder('hi', ramesh, 'Sharma General Store')).toBe(
      'नमस्ते रमेश जी, Sharma General Store में आपका 340 रुपये का हिसाब बाकी है। सुविधा हो तो कृपया चुका दीजिए। धन्यवाद!',
    );
    expect(buildReminder('mr', ramesh, 'Sharma General Store')).toBe(
      'नमस्कार रमेश, Sharma General Store मध्ये तुमचे 340 रुपये बाकी आहेत. सोयीनुसार कृपया भरावेत. धन्यवाद!',
    );
  });

  it('falls back to the first name when there is no Devanagari alias', () => {
    expect(displayName({ name: 'Suresh Kumar', aliases: ['suresh kumar'] }, 'mr')).toBe('Suresh');
  });
});
