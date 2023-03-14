

export default function PageScaffold({ children, title }) {
    return (
        <div className="page-scaffold">
            <h2 className="page-title">
                {title}
            </h2>
            {children}
        </div>
    )
}