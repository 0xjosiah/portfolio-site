import { FaDev, FaLinkedin, FaInstagramSquare, FaGithubSquare, FaTwitterSquare } from "react-icons/fa"

export default function Socials() {
    return (
        <div className='socials-links-container'>
            <a target='_blank' href='https://www.linkedin.com/in/josiahwebb/' rel='external'
                className='social-icon-link'
            >
                <FaLinkedin  className='social-icon' />
            </a>
            <a target='_blank' href='https://www.instagram.com/0xjosiah/' rel='external'
                className='social-icon-link'
            >
                <FaInstagramSquare className='social-icon' />
            </a>
            <a target='_blank' href='https://twitter.com/0xjosiah' rel='external'
                className='social-icon-link'
            >
                <FaTwitterSquare className='social-icon' />
            </a>
            <a target='_blank' href='https://github.com/0xjosiah' rel='external'
                className='social-icon-link'
            >
                <FaGithubSquare className='social-icon' />
            </a>
            <a target='_blank' href='https://dev.to/0xjosiah' rel='external'
                className='social-icon-link'
            >
                <FaDev className='social-icon' />
            </a>
        </div>
    )
}