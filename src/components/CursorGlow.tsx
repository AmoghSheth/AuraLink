import { useEffect, useState } from 'react';

const CursorGlow = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsActive(true);
      
      // Hide glow after mouse stops moving
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsActive(false), 150);
    };

    const handleMouseLeave = () => {
      setIsActive(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      className={`cursor-glow ${isActive ? 'active' : ''}`}
      style={{
        left: mousePosition.x,
        top: mousePosition.y,
      }}
    />
  );
};

export default CursorGlow;