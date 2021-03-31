const types = {
  TYPE_MANUAL: 'TYPE_MANUAL',
  TYPE_MEMBER_DURATION: 'TYPE_MEMBER_DURATION',
  TYPE_OCCASION: 'TYPE_OCCASION',
  TYPE_ACTION: 'TYPE_ACTION',
};

module.exports.types = types;

module.exports.trophies = [
  // one-off and manual trophies
  {
    name: 'TROPHY_EMAIL_VERIFIED',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-email-verified.jpg',
    title: 'Email verified',
    description: 'You have confirmed your email is real and is owned by you. Useful in case you need to reset your password',
    type: types.TYPE_MANUAL,
  },
  {
    name: 'TROPHY_AGE_VERIFIED',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-age-verified.jpg',
    title: 'Verified 18+',
    description: 'Given when a user has verified they are over 18 by sending a photo of a valid photo ID. Allows users to broadcast in age restricted rooms.',
    type: types.TYPE_MANUAL,
  },
  {
    name: 'TROPHY_SITE_SUPPORTER',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-site-supporter.jpg',
    title: 'Site supporter!',
    description: 'A user who has supported the site',
    type: types.TYPE_MANUAL,
  },
  {
    name: 'TROPHY_SITE_SUPPORTER_GOLD',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-site-supporter-gold.jpg',
    title: 'Gold site supporter!',
    description: 'A supporter who has set up recurring donation payments, or who has donated a significant amount',
    type: types.TYPE_MANUAL,
  },
  {
    name: 'TROPHY_GIFTED',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-gifted.jpg',
    title: 'Gifted support',
    description: 'Someone sent this user support status as a gift',
    type: types.TYPE_MANUAL,
  },
  {
    name: 'TROPHY_DID_GIFT',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-generous-soul.jpg',
    title: 'Generous soul',
    description: 'Sent another user support status as a gift',
    type: types.TYPE_MANUAL,
  },
  {
    name: 'TROPHY_FOUND_BUG',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-bug-found.jpg',
    title: 'Bug hunter',
    description: 'Has found a reproducable site bug with site functionality, and reported it',
    type: types.TYPE_MANUAL,
  },
  {
    name: 'TROPHY_FOUND_EXPLOIT',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-white-hat.jpg',
    title: 'White hat',
    description: 'Has found a vulnerability with the site, and reported it. (Was able to take over a room, could see IP addresses of everyone)',
    type: types.TYPE_MANUAL,
  },
  {
    name: 'TROPHY_SITE_MOD',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-site-mod.jpg',
    title: 'Site moderator',
    description: 'Site moderators are users given elevated permissions to keep the peace.',
    type: types.TYPE_MANUAL,
  },
  {
    name: 'TROPHY_SITE_ADMIN',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-admin.jpg',
    title: 'Site administrator',
    description: 'Administrators have the highest level of permissions and can assign site mods. Currently the only administrator is the site owner.',
    type: types.TYPE_MANUAL,
  },

  // Member duration
  {
    name: 'TROPHY_YEARS_ONE',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-one-year.jpg',
    title: 'Member for 1 year!',
    description: '',
    type: types.TYPE_MEMBER_DURATION,
    conditions: {
      duration: {
        years: 1,
      },
    },
  },
  {
    name: 'TROPHY_YEARS_TWO',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-two-years.jpg',
    title: 'Member for 2 years!',
    description: '',
    type: types.TYPE_MEMBER_DURATION,
    conditions: {
      duration: {
        years: 2,
      },
    },
  },
  {
    name: 'TROPHY_YEARS_THREE',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-placeholder.png',
    title: 'Member for 3 years!',
    description: '',
    type: types.TYPE_MEMBER_DURATION,
    conditions: {
      duration: {
        years: 3,
      },
    },
  },

  // Seasonal trophies

  // 2018
  {
    name: 'TROPHY_JULY_FORTH_2018',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-july-4-2018.jpg',
    title: 'Forth of July 2018',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 4,
        month: 7,
        year: 2018,
      },
    },
  },
  {
    name: 'TROPHY_HALLOWEEN_2018',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-halloween-2018.jpg',
    title: 'Halloween 2018',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 31,
        month: 10,
        year: 2018,
      },
    },
  },
  {
    name: 'TROPHY_FIFTH_NOVEMBER_2018',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-5-nov-2018.jpg',
    title: 'Fifth of November 2018',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 5,
        month: 11,
        year: 2018,
      },
    },
  },
  {
    name: 'TROPHY_XMAS_2018',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-xmas-2018.png',
    title: 'Xmas 2018',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 25,
        month: 12,
        year: 2018,
      },
    },
  },

  // 2019
  {
    name: 'TROPHY_NEW_YEARS_2019',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-newyears-2019.jpg',
    title: 'Happy new year 2019!',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 1,
        month: 1,
        year: 2019,
      },
    },
  },

  {
    name: 'TROPHY_VALENTINES_DAY_2019',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-valentines-2019.jpg',
    title: 'Valentines day 2019',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 14,
        month: 2,
        year: 2019,
      },
    },
  },
  {
    name: 'TROPHY_PI_DAY_2019',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-pi-day-2019.png',
    title: 'Pi day 2019',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 14,
        month: 3,
        year: 2019,
      },
    },
  },
  {
    name: 'TROPHY_ST_PATRICKS_DAY_2019',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-stpatricks-2019.jpg',
    title: 'St Patrick\'s day 2019',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 17,
        month: 3,
        year: 2019,
      },
    },
  },

  {
    name: 'TROPHY_CINCO_DE_MAYO_2019',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-cinco-2019.jpg',
    title: 'Cinco de Mayo 2019',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 5,
        month: 5,
        year: 2019,
      },
    },
  },
  {
    name: 'TROPHY_JULY_FORTH_2019',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-july-4-2019.jpg',
    title: 'Forth of July 2019',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 4,
        month: 7,
        year: 2019,
      },
    },
  },
  {
    name: 'TROPHY_HALLOWEEN_2019',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-halloween-2019.jpg',
    title: 'Halloween 2019',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 31,
        month: 10,
        year: 2019,
      },
    },
  },
  {
    name: 'TROPHY_FIFTH_NOVEMBER_2019',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-placeholder.png',
    title: 'Fifth of November 2019',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 5,
        month: 11,
        year: 2019,
      },
    },
  },
  {
    name: 'TROPHY_XMAS_2019',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-placeholder.png',
    title: 'Xmas 2019',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 25,
        month: 12,
        year: 2019,
      },
    },
  },
  {
    name: 'TROPHY_NEW_YEARS_2020',
    image: 'https://s3.amazonaws.com/jic-assets/trophies/trophy-placeholder.png',
    title: 'Happy new year 2020',
    description: '',
    type: types.TYPE_OCCASION,
    conditions: {
      date: {
        day: 1,
        month: 1,
        year: 2020,
      },
    },
  },
];
