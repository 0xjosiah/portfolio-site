/**
 * About this file:
 * holds all content that feeds Experience Page
 * use strings as all data types except url condition or isProjLink
 * if no url - use null
 * isProjLink is a bool on whether to add a link to Projects page on particular experience
 * duties is an array of strings, each item will be a ul list item
 */

export const jobs = [
    {
        company: 'Freelance',
        url: null, // this is a link to the company's page, null if no link
        title: 'Web Developer',
        dates: '2022 - 2023',
        duties: [
            'Designed, developed, and deployed e-commerce stores for clients',
            'Implemented feature updates and UI updates using JavaScript and Liquid',
            'Assisted clients in e-commerce platform setup and use'
        ],
        isProjLink: true,
        // projLink: '#' // this is unused but maybe in future
    },
    {
        company: 'Three.js Journey',
        url: 'https://threejs-journey.com/',
        title: 'Student',
        dates: '2022 - 2023',
        duties: [
            'Learned how to create, refine, and deploy 3D experiences on the web',
            'Utilized various JavaScript libraries: Three.js, R3F, CANNON.js, Rapier',
            'Built models in Blender for experiences'
        ],
        isProjLink: true,
        // projLink: '#' // this is unused but maybe in future
    },
    {
        company: 'Scrimba',
        url: 'https://scrimba.com/',
        title: 'Frontend Bootcamp Student',
        dates: '2022 - 2023',
        duties: [
            'Learned basic web development including JavaScript, HTML, & CSS',
            'Completed countless coding challenges and independent projects',
            'Studied various React concepts: component types, hooks, etc.'
        ],
        isProjLink: true,
        // projLink: '#' // this is unused but maybe in future
    },
    {
        company: 'TIAA',
        url: 'https://tiaa.org',
        title: 'Senior Customer Advocate',
        dates: '2019 - 2021',
        duties: [
            'Worked with clients in all matters of financial literacy and account management',
            'Researched and resolved client issues on complex financial accounts with 100% accuracy',
            'Achieved top 15% rankings among peers for client satisfaction, retention, and referrals',
            'Increased call efficiency by reducing client waiting time by 40%',
            'Promoted to senior position after only 6 months on the job'
        ],
        isProjLink: false,
        // projLink: '#' // this is unused but maybe in future
    },
    {
        company: 'Janus Henderson Investors',
        url: 'https://www.janushenderson.com/en-us/',
        title: 'Data Validation Analyst',
        dates: '2019 - 2019',
        duties: [
            'Built Excel model to identify and compile erroneous or incongruent data points',
            'Program checked and cross-referenced over 80,000 data points',
            'Increased reporting accuracy from 80% to 100%',
            'Formalized process to expedite fund reporting validation for new SEC requirements'
        ],
        isProjLink: false,
        // projLink: '#' // this is unused but maybe in future
    },
    {
        company: 'North Star Resource Group',
        url: 'https://www.northstarfinancial.com/',
        title: 'Financial Advisor',
        dates: '2015 - 2018',
        duties: [
            'Marketed, built, and managed fee-based financial planning practice generating $14.8k in annual fees',
            'Managed and advised $150k AUM and $585k assets under advisement',
            'Created and presented model retirement projections meeting client goals with 90% accuracy',
            'Performed cash flow analysis and budgeting reports helping clients achieve and maintain optimal financial ratios'
        ],
        isProjLink: false,
        // projLink: '#' // this is unused but maybe in future
    },
    {
        company: 'University of Colorado',
        url: 'https://www.colorado.edu/business/',
        title: 'Student',
        dates: '2013 - 2017',
        duties: [
            'Bachelor of Science in Business Administration',
            'Finance Major',
            'GPA: 3.7'
        ],
        isProjLink: false,
        // projLink: '#' // this is unused but maybe in future
    }
]