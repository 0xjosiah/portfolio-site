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
        /* post method */
        console.log('success', formData)
        /* clear form */
        setFormData(emptyFormData)
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
            <label>Name</label>
            <input
                autoFocus
                required
                type='text'
                name='name'
                value={formData.name}
                placeholder='Name'
                onChange={updateFormData}
            />
            <label>Email</label>
            <input
                required
                type='email'
                name='email'
                value={formData.email}
                placeholder='Email'
                onChange={updateFormData}
            />
            <label>Message</label>
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