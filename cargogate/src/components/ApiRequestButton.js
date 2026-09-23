"use client";

import { useState } from 'react';
import ApiRequestModal from './ApiRequestModal';

export default function ApiRequestButton({ className, style, children }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button 
        className={className} 
        style={style} 
        onClick={() => setIsModalOpen(true)}
      >
        {children}
      </button>
      <ApiRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  );
}
