import { useRef } from "react"

export default function Contact() {
    const form = useRef(null)

    const sendEmail = (e) => {
        e.preventDefault()
        /* TODO */
    }

    return (
        <form ref={form} onSubmit={sendEmail}>
            <label>Name</label>
            <input autoFocus required type='text' />
            <label>Email</label>
            <input required type='email' />
            <label>Message</label>
            <textarea required  />
            <button>Send</button>
        </form>
    )
}