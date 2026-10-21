/**
 * All user-facing copy lives here so every variant renders identical text.
 * Only the form *logic* differs between variants.
 */

export const APP_TITLE = "Digital Assets & Digital Legacy Safeguarding";
export const APP_SUBTITLE =
  "Tell us who should look after your digital life. It takes a few minutes and you can save your progress at any time.";

export const PRIVACY_NOTE = "Never enter passwords. We only ask who should manage your accounts.";

export const DRAFT_SAVED = "Draft saved";
export const DRAFT_SAVING = "Saving…";

export const infoText = {
  executors:
    "A Digital Executor is the person you appoint to do admin tasks on your behalf. Their role is not legally binding. At least one should be a spouse or next of kin in your Will or Power of Attorney.",
  support: "We'll provide your Digital & Social Media Will at a later date.",
};

export const labels = {
  // Step 1
  fullName: "Full name",
  previousSurname: "Previous surname",
  dob: "Date of birth",
  isOver18: "Are you currently over 18?",
  guardianPrimary: "Primary legal guardian name",
  guardianSecond: "Second legal guardian name",

  // Step 2
  execPrimary: "Primary Digital Executor",
  execSecond: "Second Digital Executor",
  execFullName: "Full name",
  execEmail: "Email",
  execPhone: "Phone",
  execRelationship: "Relationship",
  execSecondEqualAccess: "Should they have equal access and rights to your primary executor?",
  execSecondAccessExplain: "Please explain",

  // Step 3
  services: "Which core services do you use?",
  servicesOther: "Please describe the other service",
  photosBackedUp: "Have you backed up your photos?",
  photosCopyWho: "Who has a copy?",
  driveBackedUp: "Have you backed up your Drive?",
  driveCopyWho: "Who has a copy?",
  youtubeUrl: "Channel URL",
  youtubeManager: "Who should manage the channel?",

  // Step 4
  iamSetup: "Have you set up Google's Inactive Account Manager?",
  iamSupport: "Would you like support setting it up?",
  iamContacts: "Assigned Google Inactive Account Manager contacts",
  iamBypass: "Do you want to bypass Google's Inactive Account Manager?",
  contactName: "Name",
  contactEmail: "Assigned email",
  contactRelationship: "Relationship",
  contactPhone: "Phone",

  // Step 5
  fbHas: "Do you have a Facebook account?",
  fbEmail: "Which email address is used?",
  fbPhone: "Which phone number is used for 2FA?",
  fbLegacyContact: "Have you set up a Facebook Legacy Contact?",
  fbMediaDownloaded: "Have you downloaded your media from Facebook?",
  fbBackupLocation: "Where is the backup located?",
  fbBackupWho: "Who has a copy?",
  fbAccountAction: "What would you like to happen to your account?",
  fbPrivateMessagesAccess: "Would you like someone to have full access to your private messages?",
  fbPrivateMessagesWho: "Who?",
  fbMediaAccess: "Would you like someone to have access to your media (via Legacy Contact)?",
  fbSupport: "Would you like support safeguarding your account / setting up Legacy Contact?",
  fbManager: "Meta/Facebook main account manager (marketing spend for our family)",

  // Step 6
  igHas: "Do you have an Instagram account?",
  igEmail: "Which email address is used?",
  igPhone: "Which phone number is used for 2FA?",
  igPlans: "Have you made plans on Instagram?",
  igMediaDownloaded: "Have you downloaded your media?",
  igAccountAction: "What would you like to happen to your account?",
  igFullAccess: "Would you like someone to have full access to your account and private messages?",
  igFullAccessWho: "Who?",
  igSupport: "Would you like support safeguarding your Instagram account?",

  // Step 7
  consent:
    "I confirm the information above is accurate and I consent to it being used to help safeguard my digital legacy.",
  accountActionPlaceholder: "Select an option",
} as const;

export const hints = {
  dob: "You must enter a valid date that is not in the future.",
  previousSurname: "Optional — only if you've changed your surname.",
  execPhone: "International numbers are fine, e.g. +44 7700 900123.",
  youtubeUrl: "Paste the full channel link, e.g. https://youtube.com/@yourchannel.",
} as const;
