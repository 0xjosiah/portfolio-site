import { useRef, useState } from "react"
import { FaDev, FaLinkedin, FaInstagramSquare, FaGithubSquare, FaTwitterSquare } from "react-icons/fa"
import { BiSend } from "react-icons/bi"
import { RiMailSendLine } from "react-icons/ri"
import Socials from "../components/Socials"

const emptyFormData = {
    name: '',
    email: '',
    message: ''
}

export default function Contact() {
    const form = useRef(null)
    const [ formData, setFormData ] = useState(emptyFormData)
    // can be 'unsent', 'success', 'error'
    const [ formStatus, setFormStatus ] = useState('unsent')

    const sendEmail = (e) => {
        e.preventDefault()
        /* TODO */
        // add more than log for success/failure message
        // enable captcha??
        /* post method */
        emailjs.sendForm('service_l3trb9g', 'template_biop15h', form.current)
            .then((result) => {
                // update form status state
                setFormStatus('success')
                // clear form
                setFormData(emptyFormData)
                console.log('SUCCESS!', result.status, result.text)
            }, (error) => {
                setFormStatus('error')
                console.log('ERROR', error.text)
            })
    }

    const updateFormData = (e) => {
        const { name, value } = e.target 
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }))
    }

    return (
        <div className='page-scaffold'>
            {/* unsent form state */}
            { formStatus === 'unsent' &&
                <form ref={form} onSubmit={sendEmail} className='contact-form'>
                    {/* <label>Name</label> */}
                    <input
                        autoFocus
                        required
                        type='text'
                        name='name'
                        value={formData.name}
                        placeholder='Name'
                        onChange={updateFormData}
                    />
                    {/* <label>Email</label> */}
                    <input
                        required
                        type='email'
                        name='email'
                        value={formData.email}
                        placeholder='Email'
                        onChange={updateFormData}
                    />
                    {/* <label>Message</label> */}
                    <textarea
                        required
                        name='message'
                        value={formData.message}
                        placeholder='Say hey!'
                        onChange={updateFormData} 
                    />
                    <button type='submit' >
                        Send
                        <span className='send-btn-icon'>
                            <RiMailSendLine />
                        </span>
                    </button>
                </form>
            }

            {/* success form state */}
            { formStatus === 'success' &&
                <p className='page-content'>
                    <span className="keyword-callout">
                        Thanks
                    </span> for reaching out! <br/>
                    Check out my other stuff <span className="keyword-callout">
                            below
                        </span>
                    <br/>
                </p>
            }

            {/* error form state */}
            { formStatus === 'error' &&
                <h2 className='error-message'>
                    Oops, something went wrong. <br/>
                    Try again or email me directly: <br/>
                    <br/> hello@josiahwebb.com
                </h2>
            }

            {/* Contact links, visible regardless of form state */}
            {/* <div className='socials-links'>
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
            </div> */}
            <Socials />
        </div>
    )
}