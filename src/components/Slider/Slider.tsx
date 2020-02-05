import React, { useEffect, useRef, RefObject, useCallback, useState } from 'react';

type SliderParams = {
  isOpen: boolean;
  children: React.ReactNode;
  close: () => void;
  ClosingElementRef: RefObject<HTMLElement>;
};

export default function SliderView({ isOpen, children, close, ClosingElementRef }: SliderParams) {
  const ref = useRef() as RefObject<HTMLElement>;

  const handleClickOutside = useCallback(
    function(e: MouseEvent) {
      if (e.target instanceof HTMLElement && ref && ref.current && ref.current.contains(e.target)) {
        return;
      }
      if (e.target instanceof HTMLElement && ClosingElementRef && ClosingElementRef.current && ClosingElementRef.current.contains(e.target)) {
        return;
      }
      close();
    },
    [close, ref, ClosingElementRef]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, handleClickOutside]);

  return (
    <section
      className='absolute left-0 transition-trans'
      style={{ top: '1rem', transform: isOpen ? 'translateX(-100%)' : 'translateX(0%)', transition: 'transform 0.5s ease-out' }}
      ref={ref}>
      {children}
    </section>
  );
}

export function useSliderWithButton({ ButtonElement, SliderElement }: { ButtonElement: React.ReactNode; SliderElement: React.ReactNode }) {
  const SLIDER_BUTTON_REF = useRef() as RefObject<HTMLDivElement>;

  const [IS_OPEN, setIsOpen] = useState(false);

  const toggleIsOpen = () => setIsOpen(isOpen => !isOpen);

  const Slider = (
    <SliderView isOpen={IS_OPEN} close={setIsOpen.bind(null, false)} ClosingElementRef={SLIDER_BUTTON_REF}>
      {SliderElement}
    </SliderView>
  );

  const Button = (
    <div ref={SLIDER_BUTTON_REF} onClick={toggleIsOpen}>
      {ButtonElement}
    </div>
  );

  return { Slider, Button, IS_OPEN, setIsOpen, SLIDER_BUTTON_REF };
}
