import React, { useState, useEffect } from 'react';

export function Bio() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bio-container">
      <div
        className={`bio-content ${isExpanded ? 'max-h-[1000px]' : 'max-h-[300px]'} md:max-h-none`}
      >
        <p className="bio-text">
          Hi, I'm Sven Elfgren, a product-driven engineering leader passionate about crafting
          intuitive, user-focused software experiences. With over a decade in the tech industry,
          I've been the first engineering hire at startups, built and led multiple engineering
          teams, and directed substantial engineering organizations through multiple layers of
          leadership within rapidly scaling companies.
        </p>

        <p className="bio-text">
          My career has taken me on a journey from hands-on software engineering to strategic
          leadership, and I've discovered that my greatest strength is building and nurturing
          high-performing, empathetic teams. I thrive on creating collaborative environments where
          innovation meets user needs, empowering teams to achieve their best work.
        </p>

        <p className="bio-text">
          When I'm not leading teams or writing code, you'll find me diving into the intricacies of
          modern web technologies or exploring the intersection of design, technology, and human
          psychology. I'm always eager for the next challenge, especially if it pushes the
          boundaries of what's conventional or expected.
        </p>

        {/* Gradient overlay for mobile */}
        {!isExpanded && (
          <div className="md:hidden">
            <div className="bio-gradient" />
          </div>
        )}
      </div>

      {/* Expand button for mobile */}
      <div className="md:hidden mt-2 flex justify-end pointer-events-auto">
        <button onClick={() => setIsExpanded(!isExpanded)} className="bio-button w-auto px-4">
          {isExpanded ? 'Show less' : 'Read more'}
        </button>
      </div>
    </div>
  );
}
