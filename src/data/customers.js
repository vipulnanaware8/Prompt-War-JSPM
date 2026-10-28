// Customer seed — SRS Section 8.3 (fictional). No phone, address or ID fields, ever.
// `joinedDaysAgo` is turned into a real `createdAt` date by seed.js.

export const CUSTOMERS = [
  {
    id: 'c2',
    name: 'Sunita Jadhav',
    aliases: ['sunita', 'सुनीता', 'सुनिता', 'jadhav'],
    openingBalance: 650,
    joinedDaysAgo: 3,
  },
  {
    id: 'c5',
    name: 'Mohan Deshmukh',
    aliases: ['mohan', 'मोहन', 'deshmukh'],
    openingBalance: 480,
    joinedDaysAgo: 5,
  },
  {
    id: 'c1',
    name: 'Ramesh Patil',
    aliases: ['ramesh', 'रमेश', 'patil'],
    openingBalance: 240,
    joinedDaysAgo: 2,
  },
  {
    id: 'c3',
    name: 'Anil Shinde',
    aliases: ['anil', 'अनिल', 'shinde'],
    openingBalance: 120,
    joinedDaysAgo: 6,
  },
  {
    id: 'c6',
    name: 'Kavita More',
    aliases: ['kavita', 'कविता', 'kavita more'],
    openingBalance: 90,
    joinedDaysAgo: 4,
  },
  {
    id: 'c4',
    name: 'Priya Kulkarni',
    aliases: ['priya', 'प्रिया', 'kulkarni'],
    openingBalance: 0,
    joinedDaysAgo: 1,
  },
];
