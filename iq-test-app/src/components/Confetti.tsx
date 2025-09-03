import { useEffect, useRef } from "react";
import Lottie from "lottie-react";

interface ConfettiProps {
  onComplete?: () => void;
}

export default function Confetti({ onComplete }: ConfettiProps) {
  const lottieRef = useRef<any>(null);
  
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, []);
  
  // Simple confetti animation data (you can replace with actual Lottie JSON)
  const confettiData = {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 90,
    w: 400,
    h: 400,
    nm: "Confetti",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Confetti",
        sr: 1,
        ks: {
          o: { a: 0, k: 100 },
          r: { a: 0, k: 0 },
          p: { a: 0, k: [200, 200, 0] },
          a: { a: 0, k: [0, 0, 0] },
          s: { a: 0, k: [100, 100, 100] }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                d: 1,
                ty: "el",
                s: { a: 0, k: [20, 20] },
                p: { a: 0, k: [0, 0] }
              },
              {
                ty: "fl",
                c: { a: 0, k: [1, 0.5, 0, 1] }
              }
            ]
          }
        ],
        ip: 0,
        op: 90,
        st: 0,
        bm: 0
      }
    ]
  };
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <Lottie
        lottieRef={lottieRef}
        animationData={confettiData}
        loop={false}
        autoplay={true}
        onComplete={onComplete}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
