import { FaDev, FaLinkedin, FaInstagramSquare, FaGithubSquare, FaTwitterSquare } from "react-icons/fa"

export default function Socials() {
    return (
        <div className='socials-links'>
            <a target='_blank' href='https://www.linkedin.com/in/josiahwebb/' rel='external'
                className='icon-link'
            >
                <FaLinkedin  className='icon' />
            </a>
            <a target='_blank' href='https://www.instagram.com/0xjosiah/' rel='external'
                className='icon-link'
            >
                <FaInstagramSquare className='icon' />
            </a>
            <a target='_blank' href='https://twitter.com/0xjosiah' rel='external'
                className='icon-link'
            >
                <FaTwitterSquare className='icon' />
            </a>
            <a target='_blank' href='https://github.com/0xjosiah' rel='external'
                className='icon-link'
            >
                <FaGithubSquare className='icon' />
            </a>
            <a target='_blank' href='https://dev.to/0xjosiah' rel='external'
                className='icon-link'
            >
                <FaDev className='icon' />
            </a>
        </div>
    )
}