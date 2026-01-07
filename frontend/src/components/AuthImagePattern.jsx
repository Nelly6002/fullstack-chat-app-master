import { useEffect, useState } from "react";
import {
  MessageCircle,
  Users,
  Lock,
  Phone,
  Smile,
  Globe,
  ShieldCheck,
  UserPlus,
  Send,
  Camera,
  Bell,
  Mic,
  Inbox,
  Star,
  Heart,
  Key,
  Wifi,
  Video,
  Laptop,
  Monitor,
  Cloud,
  Battery,
  Eye,
  Gift,
  Search,
  Zap,
} from "lucide-react";

const allIcons = [
  MessageCircle, Users, Lock, Phone, Smile, Globe, ShieldCheck, UserPlus,
  Send, Camera, Bell, Mic, Inbox, Star, Heart, Key, Wifi, Video, Laptop,
  Monitor, Cloud, Battery, Eye, Gift, Search, Zap,
];

const getUniqueIcons = () => {
  return allIcons.sort(() => 0.5 - Math.random()).slice(0, 9);
};

const AuthImagePattern = ({ title, subtitle }) => {
  const [icons, setIcons] = useState(getUniqueIcons());
  const [fadeMap, setFadeMap] = useState(Array(9).fill(false));

  useEffect(() => {
    const updateIcon = (index) => {
      setFadeMap((prev) => {
        const copy = [...prev];
        copy[index] = true;
        return copy;
      });

      setTimeout(() => {
        setIcons((prevIcons) => {
          const used = [...prevIcons];
          used.splice(index, 1); // Remove current icon at index
          const available = allIcons.filter(
            (icon) => !used.includes(icon)
          );
          const newIcon = available[Math.floor(Math.random() * available.length)];

          const newIcons = [...prevIcons];
          newIcons[index] = newIcon;
          return newIcons;
        });

        setFadeMap((prev) => {
          const copy = [...prev];
          copy[index] = false;
          return copy;
        });
      }, 500);
    };

    // Create randomized intervals for each icon
    const intervals = icons.map((_, index) => {
      const randomTime = () => Math.floor(Math.random() * 4000) + 3000; // 3s–7s
      const intervalFunc = () => {
        updateIcon(index);
        timers[index] = setTimeout(intervalFunc, randomTime());
      };
      const timers = [];
      timers[index] = setTimeout(intervalFunc, randomTime());
      return () => clearTimeout(timers[index]);
    });

    return () => intervals.forEach((clear) => clear());
  }, [icons]);

  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-3 gap-4 mb-10">
          {icons.map((Icon, i) => (
            <div
              key={i}
              className={`aspect-square rounded-xl bg-blue-400/10 flex items-center justify-center transition-all duration-700 shadow-md ${
                fadeMap[i] ? "opacity-0 scale-90" : "opacity-100 scale-100"
              }`}
            >
              <Icon size={30} className="text-primary" />
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-bold text-base-content mb-4">{title}</h2>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
