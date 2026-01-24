import { useCallback } from "react";
import confetti from "canvas-confetti";

export const useCelebration = () => {
  const celebrate = useCallback((type: "badge" | "level" | "milestone" = "badge") => {
    const defaults = {
      spread: 360,
      ticks: 100,
      gravity: 0.8,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
    };

    const fire = (particleRatio: number, opts: Partial<confetti.Options>) => {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(200 * particleRatio),
        origin: { y: 0.7 },
      });
    };

    switch (type) {
      case "badge":
        // 🏆 Achievement unlocked - golden burst
        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
        
        // Side bursts
        setTimeout(() => {
          confetti({
            particleCount: 30,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.65 },
            colors: ["#FFE400", "#FFBD00", "#E89400"],
          });
          confetti({
            particleCount: 30,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.65 },
            colors: ["#FFE400", "#FFBD00", "#E89400"],
          });
        }, 200);
        break;

      case "level":
        // 🚀 Level up - rainbow burst
        const end = Date.now() + 1500;
        const colors = ["#bb0000", "#ff8800", "#ffff00", "#00ff00", "#0088ff", "#8800ff"];
        
        const frame = () => {
          confetti({
            particleCount: 2,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors,
          });
          confetti({
            particleCount: 2,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors,
          });
          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();
        break;

      case "milestone":
        // ⭐ Milestone - starburst
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#26ccff", "#a25afd", "#ff5e7e", "#88ff5a", "#fcff42", "#ffa62d", "#ff36ff"],
          shapes: ["star"],
          scalar: 1.2,
        });
        break;
    }
  }, []);

  const celebrateAchievement = useCallback((achievementName: string) => {
    // Trigger celebration and show toast-like notification
    celebrate("badge");
    
    // Create floating achievement notification
    const notification = document.createElement("div");
    notification.className = "fixed top-20 left-1/2 -translate-x-1/2 z-[9999] animate-fade-in";
    notification.innerHTML = `
      <div class="bg-gradient-to-r from-yellow-500/90 to-amber-500/90 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-sm border border-yellow-400/30">
        <span class="text-2xl">🏆</span>
        <div>
          <p class="font-bold text-sm">Achievement Unlocked!</p>
          <p class="text-xs opacity-90">${achievementName}</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(-50%) translateY(-20px)";
      notification.style.transition = "all 0.5s ease-out";
      setTimeout(() => notification.remove(), 500);
    }, 3500);
  }, [celebrate]);

  return {
    celebrate,
    celebrateAchievement,
  };
};
