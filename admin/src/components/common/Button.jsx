const Button = ({ children, onClick, className = "" }) => (
  <button onClick={onClick} className={`px-4 py-2 rounded bg-blue-600 text-white ${className}`}>
    {children}
  </button>
);
export default Button;
