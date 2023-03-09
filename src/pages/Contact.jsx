import { useRef, useState } from "react"

export default function Contact() {
    const form = useRef(null)
    const [ formData, setFormData ] = useState({
        name: '',
        email: '',
        message: ''
    })

    const sendEmail = (e) => {
        e.preventDefault()
        /* TODO */
    }

    const updateFormData = (e) => {
        const { name, value } = e.target 
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }))
        console.log(formData)
    }

    const styles = {
        position: 'absolute',
        top: 5,
        left: 5
    }

    return (
        <form ref={form} onSubmit={sendEmail} style={{...styles}}>
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