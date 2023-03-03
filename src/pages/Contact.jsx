import { useRef } from "react"

export default function Contact() {
    const form = useRef(null)

    const sendEmail = (e) => {
        e.preventDefault()
        /* TODO */
    }

    const styles = {
        position: 'absolute',
        top: 5,
        left: 5
    }

    return (
        <form ref={form} onSubmit={sendEmail} style={{...styles}}>
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