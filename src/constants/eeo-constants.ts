// EEO (Equal Employment Opportunity) Constants
// Required for Indeed ATS partnership compliance

export const EEO_RACE_ETHNICITY_OPTIONS = [
  { value: '', label: 'I choose not to self-identify' },
  { value: 'hispanic_latino', label: 'Hispanic or Latino' },
  { value: 'white', label: 'White (Not Hispanic or Latino)' },
  { value: 'black_african_american', label: 'Black or African American (Not Hispanic or Latino)' },
  { value: 'native_hawaiian_pacific_islander', label: 'Native Hawaiian or Other Pacific Islander (Not Hispanic or Latino)' },
  { value: 'asian', label: 'Asian (Not Hispanic or Latino)' },
  { value: 'american_indian_alaska_native', label: 'American Indian or Alaska Native (Not Hispanic or Latino)' },
  { value: 'two_or_more_races', label: 'Two or More Races (Not Hispanic or Latino)' },
];

export const EEO_GENDER_OPTIONS = [
  { value: '', label: 'I choose not to self-identify' },
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'other', label: 'Other' },
];

export const EEO_VETERAN_STATUS_OPTIONS = [
  { value: '', label: 'I choose not to self-identify' },
  { value: 'not_veteran', label: 'I am not a protected veteran' },
  { value: 'veteran', label: 'I identify as one or more of the classifications of protected veteran' },
];

export const EEO_DISABILITY_STATUS_OPTIONS = [
  { value: '', label: 'I choose not to self-identify' },
  { value: 'no_disability', label: 'No, I do not have a disability' },
  { value: 'has_disability', label: 'Yes, I have a disability (or previously had a disability)' },
];

export const EEO_DISCLAIMER_TEXT = `
The information you provide is voluntary and will be kept confidential. It will be used only for federal reporting requirements and will not be used in making any employment decisions. Your refusal to provide this information will not subject you to any adverse treatment.

This information is being requested in accordance with regulations of the Office of Federal Contract Compliance Programs (OFCCP) and the Equal Employment Opportunity Commission (EEOC). These regulations require federal contractors to collect and maintain records of applicant demographic information for analytical purposes.
`;

export const EEO_VETERAN_DISCLAIMER_TEXT = `
Protected veterans include disabled veterans, recently separated veterans, active duty wartime or campaign badge veterans, and Armed Forces service medal veterans. Please identify if you are a member of one or more of these protected veteran categories.
`;

export const EEO_DISABILITY_DISCLAIMER_TEXT = `
You are considered to have a disability if you have a physical or mental impairment or medical condition that substantially limits a major life activity, or if you have a history or record of such an impairment or medical condition. Disabilities include, but are not limited to: autism, autoimmune disorder, blindness or low vision, cancer, cardiovascular or heart disease, celiac disease, cerebral palsy, deaf or hard of hearing, depression or anxiety, diabetes, epilepsy, gastrointestinal disorders, intellectual disability, missing limbs or partially missing limbs, nervous system condition, psychiatric condition, pulmonary or respiratory conditions, and more.
`;
