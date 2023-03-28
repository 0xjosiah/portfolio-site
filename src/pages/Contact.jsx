import { useRef, useState } from "react"
import { RiMailSendLine } from "react-icons/ri"
import PageScaffold from "../components/PageScaffold"

const emptyFormData = {
    name: '',
    email: '',
    message: ''
}

export default function Contact() {
    const form = useRef(null)
    const [ formData, setFormData ] = useState(emptyFormData)
    /* can be 'unsent', 'success', 'error' */
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
        <PageScaffold socials={true} noTitle={true}>
            {/* unsent form state */}
            { formStatus === 'unsent' &&
                <form ref={form} onSubmit={sendEmail} className='contact-form'>
                    <input
                        autoFocus
                        type='text'
                        name='name'
                        value={formData.name}
                        placeholder='Name'
                        onChange={updateFormData}
                        aria-label='full name'
                        required
                    />
                    <input
                        type='email'
                        name='email'
                        value={formData.email}
                        placeholder='Email'
                        onChange={updateFormData}
                        aria-label='email address'
                        required
                    />
                    <textarea
                        name='message'
                        value={formData.message}
                        placeholder='Say hey!'
                        onChange={updateFormData} 
                        aria-label='your message to me'
                        required
                    />
                    <button className='btn' type='submit' >
                        Send
                        <span className='inline-icon'>
                            <RiMailSendLine />
                        </span>
                    </button>
                </form>
            }

            {/* success form state */}
            { formStatus === 'success' &&
                <p className='page-section-primary'>
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
        </PageScaffold>
    )
}