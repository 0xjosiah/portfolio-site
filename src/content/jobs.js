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
            'Designed, developed, and deployed e-commerce store for client',
            'Implemented feature updates and UI updates',
            'Assisted client in e-commerce platform setup and use',
        ],
        isProjLink: true,
        // projLink: '#' // this is unused but maybe in future
    },
    {
        company: 'Three JS Journey',
        url: 'https://threejs-journey.com/',
        title: 'Student',
        dates: '2022 - 2023',
        duties: [
            'this, that, and the other',
            'this, that, and the other',
            'this, that, and the other',
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
            'thay, that, and the other',
            'this, that, and the other',
            'this, that, and the other',
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
            'Researched and resolved client issues on complex retirement plan details with 100% accuracy',
            'Created and implemented process improvements to reduce workloads and bolster callback efficiency',
            'Achieved top quartile satisfaction, retention, and referral rankings on consistent basis',
            'Promoted investment and advice services resulting in monthly 1% referral rate increase for 2 consecutive quarters',
            'Met and exceeded requirements for call quality and client experience by 10%',
            'Increased call efficiency by reducing client waiting time by 40%'
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
            'Model checked and cross-referenced over 80,000 data points, for over 4,000 securities in 55 funds',
            'Increased reporting accuracy from 80% to 100%',
            'Formalized process to expedite fund reporting validation for Investment Company Reporting Modernization'
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
            'GPA: 3.7'
        ],
        isProjLink: false,
        // projLink: '#' // this is unused but maybe in future
    }
]