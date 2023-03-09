import { useThree } from "@react-three/fiber"
import { useRef, useState } from "react"

const emptyFormData = {
    name: '',
    email: '',
    message: ''
}

export default function Contact() {
    const form = useRef(null)
    const [ formData, setFormData ] = useState(emptyFormData)

    const sendEmail = (e) => {
        e.preventDefault()
        /* TODO */
        // add more than log for success/failure message
        /* post method */
        emailjs.sendForm('service_l3trb9g', 'template_biop15h', form.current)
            .then((result) => {
                console.log('SUCCESS!', result.status, result.text)
            }, (error) => {
                console.log('ERROR', error.text)
            })
            /* clear form */
            .then(() => setFormData(emptyFormData))
    }

    const updateFormData = (e) => {
        const { name, value } = e.target 
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }))
    }

    return (
        <form ref={form} onSubmit={sendEmail} className='contact-form' >
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
            <button>Send</button>
        </form>
    )
}