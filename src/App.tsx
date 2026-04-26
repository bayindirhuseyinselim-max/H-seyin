/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Calendar, Clock, MapPin, Sparkles, Music2, Volume2, VolumeX, Cake } from 'lucide-react';
import { generateBirthdayPoem } from './services/geminiService';
import confetti from 'canvas-confetti';
import { QRCodeSVG } from 'qrcode.react';
import ReactPlayer from 'react-player';

const Player = ReactPlayer as any;

const BIRTHDAY_DATE = new Date('2026-04-28T00:00:00');
const PARTY_DATE = new Date('2026-04-28T16:20:00');
const MUSIC_URL = "/music.mp3"; 
// NOT: Kendi müziğinizi kullanmak için dosyayı sol taraftan yükleyip yolu buraya yazın.
// Örn: const MUSIC_URL = "/dosya_adi.mp3";

export default function App() {
  const [birthdayTimeLeft, setBirthdayTimeLeft] = useState(calculateTimeLeft(BIRTHDAY_DATE));
  const [partyTimeLeft, setPartyTimeLeft] = useState(calculateTimeLeft(PARTY_DATE));
  const [poem, setPoem] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const playerRef = useRef<any>(null);
  const isTransitioning = useRef(false);
  const lastToggleTime = useRef(0);

  const triggerConfetti = () => {
    if (typeof window === 'undefined') return;
    try {
      // Use a explicitly created instance if the global one fails or to be safer
      // We check if confetti is available as a function
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#BE185D', '#db2777', '#f472b6', '#ffffff'],
          zIndex: 10000
        });
      }
    } catch (e) {
      console.warn("Confetti call failed:", e);
    }
  };

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        console.log("First interaction detected");
        setHasInteracted(true);
        setIsPlaying(true);
      }
    };
    
    // We already have a specific button, but window listener is a good fallback for anywhere else
    if (!hasInteracted) {
      window.addEventListener('click', handleFirstInteraction, { once: true });
    }
    return () => window.removeEventListener('click', handleFirstInteraction);
  }, [hasInteracted]);

  function calculateTimeLeft(target: Date) {
    const now = new Date();
    const difference = target.getTime() - now.getTime();

    if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60)
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setBirthdayTimeLeft(calculateTimeLeft(BIRTHDAY_DATE));
      setPartyTimeLeft(calculateTimeLeft(PARTY_DATE));
    }, 1000);

    const loadPoem = async () => {
      const p = await generateBirthdayPoem('Betül');
      setPoem(p || '');
      setIsLoaded(true);
      // Trigger confetti on load once poem is ready for extra flair
      setTimeout(triggerConfetti, 1000);
    };
    loadPoem();

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative min-h-screen text-white selection:bg-pink-500/30">
      {/* Background Atmosphere */}
      <div className="atmosphere" />
      
      {/* Entrance Shield */}
      <AnimatePresence>
        {!hasInteracted && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="absolute inset-0 atmosphere opacity-50" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10"
            >
              <div className="serif italic text-pink-500 text-6xl mb-8 leading-tight">Betülüme...</div>
              <p className="text-pink-100/40 uppercase tracking-[0.5em] text-[10px] mb-12">28 Nisan 2026</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setHasInteracted(true);
                  setIsPlaying(true);
                }}
                className="bg-white text-black px-12 py-5 rounded-full text-xs font-bold tracking-[0.4em] uppercase shadow-2xl shadow-pink-500/20 hover:bg-pink-500 hover:text-white transition-all duration-500"
              >
                Davetiyeyi Aç
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed opacity-0 pointer-events-none z-[-1]" style={{ width: '1px', height: '1px', overflow: 'hidden' }}>
        <Player
          ref={playerRef}
          url={MUSIC_URL}
          playing={isPlaying && hasInteracted && isPlayerReady}
          loop={true}
          volume={0.6}
          muted={false}
          controls={false}
          width="100%"
          height="100%"
          playsinline={true}
          config={{
            youtube: {
              playerVars: { 
                autoplay: 1, 
                modestbranding: 1,
                rel: 0,
                iv_load_policy: 3,
                enablejsapi: 1,
                origin: typeof window !== 'undefined' ? window.location.origin : '',
                widget_referrer: typeof window !== 'undefined' ? window.location.origin : ''
              }
            },
            file: {
              forceAudio: true,
              attributes: {
                preload: "auto"
              }
            }
          }}
          onReady={() => {
            console.log("Player is ready");
            setIsPlayerReady(true);
          }}
          onStart={() => console.log("Music playback started")}
          onPlay={() => {
            console.log("Player started playing");
          }}
          onPause={() => {
            console.log("Player paused");
          }}
          onError={(e: any) => {
            console.error("Music playback error:", e);
          }}
        />
      </div>
      <div className="fixed -top-40 -left-40 w-96 h-96 glow-circle pointer-events-none opacity-50" />
      <div className="fixed top-1/2 -right-40 w-[500px] h-[500px] glow-circle pointer-events-none opacity-30" />

      {/* Floating Elements */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="fixed z-20 pointer-events-none"
          initial={{ 
            x: Math.random() * 100 + 'vw', 
            y: '110vh',
            scale: Math.random() * 0.5 + 0.5,
            opacity: 0
          }}
          animate={{ 
            y: '-10vh',
            opacity: [0, 0.4, 0.4, 0],
            rotate: 360
          }}
          transition={{ 
            y: {
              duration: Math.random() * 15 + 15, 
              repeat: Infinity,
              delay: Math.random() * 20,
              ease: "linear"
            },
            opacity: {
              duration: Math.random() * 15 + 15, 
              repeat: Infinity,
              delay: Math.random() * 20,
              ease: "linear"
            },
            rotate: {
              duration: Math.random() * 15 + 15, 
              repeat: Infinity,
              delay: Math.random() * 20,
              ease: "linear"
            }
          }}
        >
          <motion.div
            whileHover={{ 
              scale: 2.2, 
              rotate: [0, -10, 10, 0],
              transition: { duration: 0.3 }
            }}
            className="inline-block pointer-events-auto cursor-pointer p-4 group"
          >
            <Heart 
              className="text-pink-500/40 fill-pink-500/20 group-hover:text-pink-400 group-hover:fill-pink-400 transition-all duration-300 drop-shadow-[0_0_8px_rgba(236,72,153,0.3)] group-hover:drop-shadow-[0_0_15px_rgba(236,72,153,0.8)]" 
              size={Math.random() * 30 + 15}
            />
          </motion.div>
        </motion.div>
      ))}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        
        {/* Navigation / Header Accent */}
        <header className="flex justify-between items-center mb-20 opacity-60">
           <div className="serif italic tracking-[0.2em] text-sm uppercase">B & H</div>
           <div className="text-[10px] uppercase tracking-[0.4em] font-semibold">28 Nisan 2026</div>
        </header>

        {/* Hero Section */}
        <section className="text-center mb-32 min-h-[50vh] flex flex-col items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
          >
            <span className="text-pink-500 uppercase tracking-[0.6em] text-[10px] font-bold mb-6 block">
              Sonsuza Dek Beraber
            </span>
            <h1 className="serif text-7xl md:text-9xl mb-8 leading-tight glow-text italic">
              İyi ki Doğdun, <br />
              <span className="not-italic font-bold text-white">Betül</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-pink-100/60 font-light leading-relaxed">
              Hayatımın en güzel rengi, her anın mutlulukla dolu olsun. 
              Seninle geçen her gün benim için paha biçilemez bir hediye.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <div className="mt-16 flex flex-wrap justify-center gap-6">
            <div className="glass px-8 py-4 rounded-full flex items-center space-x-3 cursor-default">
              <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse"></span>
              <span className="text-xs tracking-[0.3em] uppercase font-semibold">Parti: 16.20</span>
            </div>
            <button 
              onClick={triggerConfetti}
              className="bg-white text-black px-12 py-4 rounded-full text-xs font-bold tracking-[0.3em] uppercase hover:bg-pink-500 hover:text-white transition-all duration-500 shadow-xl shadow-pink-500/10"
            >
              Seni Seviyorum
            </button>
          </div>
        </section>

        {/* Countdown Sections */}
        <section className="mb-32 space-y-12">
          {/* Birthday Countdown */}
          <div 
            className="glass p-12 md:p-16 rounded-[40px] relative overflow-hidden group cursor-help"
            title="28 Nisan 2026, Saat 00:00"
          >
            <div className="absolute top-0 right-0 w-64 h-64 glow-circle opacity-20 -translate-y-1/2 translate-x-1/2" />
            <h2 className="text-center text-pink-100/40 serif text-lg mb-12 uppercase tracking-[0.3em]">Doğum Gününe Kalan Süre</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              {[
                { label: 'Gün', value: birthdayTimeLeft.days },
                { label: 'Saat', value: birthdayTimeLeft.hours },
                { label: 'Dakika', value: birthdayTimeLeft.minutes },
                { label: 'Saniye', value: birthdayTimeLeft.seconds }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-5xl md:text-7xl font-light text-white mb-2">{item.value.toString().padStart(2, '0')}</span>
                  <span className="text-pink-500/60 uppercase text-[10px] tracking-[0.4em] font-bold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Party Countdown */}
          <div 
            className="glass p-10 md:p-12 rounded-[40px] relative overflow-hidden group opacity-80 hover:opacity-100 transition-opacity cursor-help"
            title="28 Nisan 2026, Saat 16:20"
          >
            <div className="absolute bottom-0 left-0 w-48 h-48 glow-circle opacity-10 translate-y-1/2 -translate-x-1/2" />
            <h2 className="text-center text-pink-100/40 serif text-lg mb-10 uppercase tracking-[0.3em]">Partiye Kalan Süre</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center relative z-10">
              {[
                { label: 'Gün', value: partyTimeLeft.days },
                { label: 'Saat', value: partyTimeLeft.hours },
                { label: 'Dakika', value: partyTimeLeft.minutes },
                { label: 'Saniye', value: partyTimeLeft.seconds }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-4xl md:text-6xl font-light text-white/90 mb-1">{item.value.toString().padStart(2, '0')}</span>
                  <span className="text-pink-500/40 uppercase text-[8px] tracking-[0.4em] font-bold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Details Section */}
        <section className="grid md:grid-cols-3 gap-8 mb-32">
          {[
            { icon: Calendar, title: 'Tarih', value: '28 Nisan 2026', sub: 'Salı Günü', full: '28 Nisan 2026' },
            { icon: Clock, title: 'Zaman', value: '16:20', sub: 'Öğleden Sonra', full: 'Saat 16:20' },
            { icon: MapPin, title: 'Mekan', value: 'Şehitler Parkı', sub: 'Buluşma Noktası', full: 'Şehitler Parkı, Buluşma Alanı' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10, backgroundColor: 'rgba(255,255,255,0.05)' }}
              className="glass p-10 rounded-3xl flex flex-col items-center text-center transition-all duration-300 cursor-help"
              title={item.full}
            >
              <div className="w-14 h-14 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 border border-pink-500/20">
                <item.icon className="text-pink-500" size={24} />
              </div>
              <h3 className="serif text-sm uppercase tracking-widest mb-4 text-pink-400 font-bold">{item.title}</h3>
              <p className="text-xl font-light text-white mb-1 tracking-wide">{item.value}</p>
              <p className="text-xs text-white/30 tracking-widest uppercase">{item.sub}</p>
            </motion.div>
          ))}
        </section>

        {/* QR Code Section */}
        <section className="mb-32 flex flex-col items-center">
            <h2 className="text-center text-pink-100/40 serif text-lg mb-12 uppercase tracking-[0.3em]">Parti'nin Konumu</h2>
            <motion.div 
                whileHover={{ scale: 1.05 }}
                className="glass p-8 rounded-[40px] cursor-pointer group"
                onClick={() => window.open('https://maps.app.goo.gl/9bNYM9YWzTSWMRPD7', '_blank')}
            >
                <div className="bg-white p-6 rounded-3xl shadow-2xl shadow-pink-500/10">
                    <QRCodeSVG 
                        value="https://maps.app.goo.gl/9bNYM9YWzTSWMRPD7"
                        size={180}
                        level="H"
                        includeMargin={false}
                    />
                </div>
                <div className="mt-8 text-center">
                    <p className="text-xs uppercase tracking-[0.4em] font-bold text-pink-500 group-hover:text-white transition-colors uppercase">Yol Tarifi İçin Tıkla</p>
                    <p className="text-[10px] text-white/40 mt-3 uppercase tracking-[0.2em]">Haritalarda Aç</p>
                </div>
            </motion.div>
        </section>

        {/* Poem Section */}
        <section className="mb-32">
          <AnimatePresence mode="wait">
            {isLoaded ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass p-16 md:p-24 rounded-[60px] text-center relative overflow-hidden"
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[180px] serif opacity-[0.02] select-none pointer-events-none">
                  BETÜL
                </div>
                <div className="relative z-10">
                  <Sparkles className="text-pink-500 mx-auto mb-10" size={48} />
                  <h2 className="serif text-4xl md:text-5xl text-white mb-12 italic glow-text">Kalbimin Sesi</h2>
                  <div className="serif text-2xl md:text-3xl text-pink-50/80 leading-[1.8] max-w-3xl mx-auto italic font-light whitespace-pre-wrap">
                    &quot;{poem}&quot;
                  </div>
                  <div className="mt-16 text-pink-500 font-bold tracking-[0.4em] uppercase text-xs">
                    Seni Seviyorum
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-96 flex items-center justify-center">
                <div className="relative">
                   <div className="absolute inset-0 blur-2xl bg-pink-500 opacity-20" />
                   <motion.div
                     animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                     transition={{ duration: 2, repeat: Infinity }}
                   >
                     <Heart className="text-pink-500 fill-pink-500" size={40} />
                   </motion.div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </section>

        {/* Future Messages Section */}
        <section className="mb-32 relative">
          <h2 className="text-center text-pink-100/40 serif text-lg mb-16 uppercase tracking-[0.5em]">Geleceğe Notlar</h2>
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass p-12 rounded-[40px] border-l-4 border-l-pink-500/50"
            >
              <Clock className="text-pink-500 mb-6" size={24} />
              <div className="serif text-xl text-white/90 leading-relaxed italic">
                &quot;Bu doğum gününün üzerinden aylar geçmiş olacak bu satırları tekrar okuduğunda... Bilmeni isterim ki; sana olan sevgim her gün o günkünden daha derin. Birlikte yaşlanacağımız o güzel yılları her gün seninle yeniden kuruyorum.&quot;
              </div>
              <div className="mt-8 text-[10px] uppercase tracking-widest text-pink-500/60 font-bold">2026 ve Ötesi İçin</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="glass p-12 rounded-[40px] border-r-4 border-r-pink-500/50"
            >
              <Heart className="text-pink-500 mb-6" size={24} />
              <div className="serif text-xl text-white/90 leading-relaxed italic">
                &quot;Geleceğimiz; senin gülüşün kadar parlak, kalbin kadar huzurlu olacak sevgilim. Hayat bizi nereye sürüklerse sürüklesin, kalbimdeki pusula her zaman seni gösterecek. İyi ki o gün doğdun sevgilim.&quot;
              </div>
              <div className="mt-8 text-[10px] uppercase tracking-widest text-pink-500/60 font-bold">Sonsuz Bir Söz</div>
            </motion.div>
          </div>
        </section>

        {/* Decorative Watermark */}
        <div className="absolute top-0 right-10 text-[150px] font-serif opacity-[0.03] select-none pointer-events-none">
          LOVE
        </div>

        {/* Footer */}
        <footer className="text-center py-24 mb-10">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} 
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block mb-10"
          >
            <Heart className="text-pink-500 fill-pink-500" size={24} />
          </motion.div>
          <div className="serif italic text-[24px] opacity-40 mb-2">Daima ve Sonsuza Dek</div>
          <div className="text-[10px] uppercase tracking-[0.8em] font-bold opacity-20">Betül • 2026</div>
        </footer>

      </main>

      {/* Control Indicator */}
      <div className="fixed bottom-8 right-8 flex flex-col items-center space-y-2 z-50">
        {!hasInteracted && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-pink-500 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-bold shadow-lg"
          >
            Müziği Başlat
          </motion.div>
        )}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            const now = Date.now();
            
            // Prevent rapid toggling that causes play() interruption errors
            if (now - lastToggleTime.current < 1200) {
              console.log("Toggle ignored (throttled)");
              return;
            }
            lastToggleTime.current = now;

            if (!hasInteracted) {
              setHasInteracted(true);
              setIsPlaying(true);
            } else {
              setIsPlaying(!isPlaying);
            }
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-16 h-16 glass rounded-full flex items-center justify-center text-pink-500 hover:bg-pink-500/10 transition-colors shadow-2xl"
        >
          {isPlaying ? <Volume2 /> : <VolumeX className="opacity-30" />}
        </motion.button>
      </div>
    </div>
  );
}
