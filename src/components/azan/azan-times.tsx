'use client';

import { useState, useEffect } from 'react';
import { FaSpinner } from 'react-icons/fa';

interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface AzanResponse {
  code: number;
  status: string;
  data: {
    timings: PrayerTimes & Record<string, string>;
    date: {
      readable: string;
      timestamp: string;
      hijri: {
        date: string;
        day: string;
        month: {
          number: number;
          en: string;
          ar: string;
        };
        year: string;
      };
      gregorian: {
        date: string;
        day: string;
        month: {
          number: number;
          en: string;
        };
        year: string;
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
    };
  };
}

export default function AzanTimes() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [nextPrayer, setNextPrayer] = useState<{ name: string; time: string } | null>(null);
  const [location, setLocation] = useState<string>('');
  const [hijriDate, setHijriDate] = useState<string>('');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
        },
        () => {
          setError('Unable to get your location. Prayer times cannot be displayed.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser. Prayer times cannot be displayed.');
      setLoading(false);
    }
  }, []);

  const fetchPrayerTimes = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
      }

      const data: AzanResponse = await response.json();

      setPrayerTimes({
        Fajr: data.data.timings.Fajr,
        Sunrise: data.data.timings.Sunrise,
        Dhuhr: data.data.timings.Dhuhr,
        Asr: data.data.timings.Asr,
        Maghrib: data.data.timings.Maghrib,
        Isha: data.data.timings.Isha,
      });

      setHijriDate(`${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`);

      try {
        const geocodeResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.address) {
          const address = geocodeData.address;
          const city = address.city || address.town || address.village || address.county || '';
          const country = address.country || '';
          setLocation(`${city}${city && country ? ', ' : ''}${country}`);
        } else {
          setLocation('Your Location');
        }
      } catch {
        setLocation('Your Location');
      }

      calculateNextPrayer(data.data.timings);
      setLoading(false);
    } catch {
      setError('Failed to fetch prayer times. Please try again later.');
      setLoading(false);
    }
  };

  const calculateNextPrayer = (timings: PrayerTimes & Record<string, string>) => {
    const now = new Date();
    const prayers = [
      { name: 'Fajr', time: timings.Fajr },
      { name: 'Sunrise', time: timings.Sunrise },
      { name: 'Dhuhr', time: timings.Dhuhr },
      { name: 'Asr', time: timings.Asr },
      { name: 'Maghrib', time: timings.Maghrib },
      { name: 'Isha', time: timings.Isha },
    ];

    const prayerDates = prayers.map((prayer) => {
      const [hour, minute] = prayer.time.split(':').map((num) => Number.parseInt(num, 10));
      const prayerDate = new Date(now);
      prayerDate.setHours(hour, minute, 0, 0);
      return { name: prayer.name, date: prayerDate };
    });

    const nextPrayerObj = prayerDates.find((prayer) => prayer.date > now);

    if (nextPrayerObj) {
      setNextPrayer({
        name: nextPrayerObj.name,
        time: nextPrayerObj.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else {
      setNextPrayer({ name: 'Fajr (Tomorrow)', time: prayers[0].time });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <FaSpinner className="animate-spin text-white mr-1 text-[8px]" />
        <span className="text-[8px]">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-white text-[8px] opacity-80">{error}</div>
      </div>
    );
  }

  // Ultra-compact layout with bigger font
  return (
    <div className="flex-1 text-white">
      <div className="flex h-full items-center">
        <div className="flex-1 flex flex-col justify-center">
          <div className="flex justify-end items-center">
            {nextPrayer && (
              <div className="bg-white/20 px-1 py-0 rounded text-[9px] mr-1 leading-tight whitespace-nowrap max-w-[calc(100vw-60px)] overflow-hidden text-ellipsis">
                <span className="font-semibold">{nextPrayer.name}: {nextPrayer.time}</span>
              </div>
            )}
            <span className="text-[7px] opacity-80 whitespace-nowrap">{hijriDate}</span>
          </div>
          {prayerTimes && (
            <div className="grid grid-cols-6 gap-px text-center text-[8px] leading-tight mt-0.5">
              <div>
                <div className="font-medium">Fajr</div>
                <div className="bg-white/10 px-1 rounded">{prayerTimes.Fajr}</div>
              </div>
              <div>
                <div className="font-medium">Sunrise</div>
                <div className="bg-white/10 px-1 rounded">{prayerTimes.Sunrise}</div>
              </div>
              <div>
                <div className="font-medium">Dhuhr</div>
                <div className="bg-white/10 px-1 rounded">{prayerTimes.Dhuhr}</div>
              </div>
              <div>
                <div className="font-medium">Asr</div>
                <div className="bg-white/10 px-1 rounded">{prayerTimes.Asr}</div>
              </div>
              <div>
                <div className="font-medium">Maghrib</div>
                <div className="bg-white/10 px-1 rounded">{prayerTimes.Maghrib}</div>
              </div>
              <div>
                <div className="font-medium">Isha</div>
                <div className="bg-white/10 px-1 rounded">{prayerTimes.Isha}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
