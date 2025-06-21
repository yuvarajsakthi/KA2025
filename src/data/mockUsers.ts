
import { User } from "@/types/User";

// Generate initials from name
const generateInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
};

// Generate random color
const getRandomColor = (index: number): string => {
  const colors = [
    'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
    'bg-red-500', 'bg-yellow-500', 'bg-indigo-500', 'bg-cyan-500',
    'bg-orange-500', 'bg-teal-500', 'bg-lime-500', 'bg-violet-500'
  ];
  return colors[index % colors.length];
};

const userProfiles = [
  {
    "name": "Abdul Khader Maideen S",
    "hackerrank": "abdulkhader12111",
    "leetcode": "Abdulkhader12"
  },
  {
    "name": "Anupam Agrawal",
    "hackerrank": "30anupam_agrawal",
    "leetcode": "Anupam_Agrawal_65"
  },
  {
    "name": "B Mounika",
    "hackerrank": "21HR1A0567",
    "leetcode": "Mounika_B"
  },
  {
    "name": "Bavigadda Manohar",
    "hackerrank": "manoharbavigadda",
    "leetcode": "ManoharBavigadda"
  },
  {
    "name": "Chaman Prakash",
    "hackerrank": "chaman532003",
    "leetcode": "chaman532003"
  },
  {
    "name": "D.S.Jayasree",
    "hackerrank": "jayasreedesagiri",
    "leetcode": "JayasreeDesagiri"
  },
  {
    "name": "DUGASANI MEGHANA",
    "hackerrank": "meghanadugasani",
    "leetcode": "meghanadugasani"
  },
  {
    "name": "G Charan",
    "hackerrank": "charansuhas1424",
    "leetcode": "g_charan"
  },
  {
    "name": "Guravarajupeta Jyothi Narayana Reddy",
    "hackerrank": "jyothinarayana73",
    "leetcode": "Jyothi_Narayana_Reddy"
  },
  {
    "name": "Hadiya Amber",
    "hackerrank": "ambersharief811",
    "leetcode": "Hadiya_Amber"
  },
  {
    "name": "Hajeera Thabasum A",
    "hackerrank": "hajeerathabasum1",
    "leetcode": "Hajeera_Thabasum_A"
  },
  {
    "name": "Harish K",
    "hackerrank": "harishk17072003",
    "leetcode": "harishk17072003"
  },
  {
    "name": "Hishitha G J",
    "hackerrank": "hishitha_g_j",
    "leetcode": "Hishitha-G-J"
  },
  {
    "name": "Janani M",
    "hackerrank": "jananiem02",
    "leetcode": null
  },
  {
    "name": "K.Sankar",
    "hackerrank": "sankarkrishnan21",
    "leetcode": null
  },
  {
    "name": "Karamala Vinay",
    "hackerrank": "karamalavinay201",
    "leetcode": "karamalavinay"
  },
  {
    "name": "Kumaran S",
    "hackerrank": "kumaran_z",
    "leetcode": "kumaran_z"
  },
  {
    "name": "Lalith kumar s",
    "hackerrank": "lalithkumarfl",
    "leetcode": null
  },
  {
    "name": "Laya Sri Ramamurthy",
    "hackerrank": "layasri",
    "leetcode": "layasrir234"
  },
  {
    "name": "M. Jagadish",
    "hackerrank": "manginijagadish",
    "leetcode": "Jagadish_571"
  },
  {
    "name": "Maegesh S",
    "hackerrank": "maggichan001",
    "leetcode": "Maegesh"
  },
  {
    "name": "MANDHA PRATHYUSHA",
    "hackerrank": "202U1A0555",
    "leetcode": "prathyusha_315"
  },
  {
    "name": "Pradeepkumar M",
    "hackerrank": "pradeepkumarmec2",
    "leetcode": "pradeepkumar2406"
  },
  {
    "name": "pujannagari pallavi",
    "hackerrank": "21HR1A0598",
    "leetcode": "pujannagari_pallavi98"
  },
  {
    "name": "Purva kaiwart",
    "hackerrank": "purvakaiwart9896",
    "leetcode": "misspurva"
  },
  {
    "name": "Raju Gowtham",
    "hackerrank": "21HR1A05A2",
    "leetcode": "Raju_Gowtham"
  },
  {
    "name": "RAKSHITHA BS",
    "hackerrank": "rakshithabs2002",
    "leetcode": null
  },
  {
    "name": "Reshni S",
    "hackerrank": "reshni1975",
    "leetcode": null
  },
  {
    "name": "Sakepuram Vinaya",
    "hackerrank": "21HR1A05B1",
    "leetcode": "Sakepuram_Vinaya"
  },
  {
    "name": "SUJITH KUMAR S",
    "hackerrank": "skempire",
    "leetcode": "skempire"
  },
  {
    "name": "Vaka Kiran reddy",
    "hackerrank": "kiranreddyvaka4",
    "leetcode": null
  },
  {
    "name": "Visnu Prian M C",
    "hackerrank": "visnuprian",
    "leetcode": null
  },
  {
    "name": "Yashwanth malladi",
    "hackerrank": "yashwanthmallad1",
    "leetcode": null
  },
  {
    "name": "Yuvaraj S",
    "hackerrank": "yuvarajsakthi003",
    "leetcode": "YuvarajSakthi"
  }
];

export const mockUsers: User[] = userProfiles.map((profile, index) => {
  const initials = generateInitials(profile.name);
  const color = getRandomColor(index);
  
  return {
    id: (index + 1).toString(),
    name: profile.name,
    avatar: { 
      type: 'letter', 
      initials: initials, 
      color: color 
    },
    githubUrl: `https://github.com/${profile.hackerrank}`,
    leetcodeUrl: profile.leetcode ? `https://leetcode.com/${profile.leetcode}` : "",
    hackerrankUrl: `https://hackerrank.com/${profile.hackerrank}`,
    leetcode: {
      problemsSolved: 0,
      ranking: 0,
      acceptanceRate: 0,
      easyProblems: 0,
      mediumProblems: 0,
      hardProblems: 0
    },
    hackerrankBadges: [],
    hackerrankCertificates: []
  };
});
