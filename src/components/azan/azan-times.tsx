'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FaMosque, FaLocationArrow, FaSpinner } from 'react-icons/fa';

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
  const [nextPrayer, setNextPrayer] = useState<{name: string; time: string} | null>(null);
  const [location, setLocation] = useState<string>('');
  const [hijriDate, setHijriDate] = useState<string>('');

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchPrayerTimes(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
          console.error("Error getting location:", err);
          setError("Unable to get your location. Prayer times cannot be displayed.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser. Prayer times cannot be displayed.");
      setLoading(false);
    }
  }, []);

  const fetchPrayerTimes = async (latitude: number, longitude: number) => {
    try {
      // Method 2 is ISNA method
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
        Isha: data.data.timings.Isha
      });

      setHijriDate(`${data.data.date.hijri.day} ${data.data.date.hijri.month.en} ${data.data.date.hijri.year}`);

      // Try to get approximate location name using reverse geocoding
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
      } catch (error) {
        console.error("Error fetching location name:", error);
        setLocation('Your Location');
      }

      calculateNextPrayer(data.data.timings);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching prayer times:", error);
      setError("Failed to fetch prayer times. Please try again later.");
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
      { name: 'Isha', time: timings.Isha }
    ];

    // Convert prayer times to Date objects
    const prayerDates = prayers.map(prayer => {
      const [hour, minute] = prayer.time.split(':').map(num => Number.parseInt(num, 10));
      const prayerDate = new Date(now);
      prayerDate.setHours(hour, minute, 0, 0);
      return { name: prayer.name, date: prayerDate };
    });

    // Find the next prayer
    const nextPrayerObj = prayerDates.find(prayer => prayer.date > now);

    if (nextPrayerObj) {
      setNextPrayer({
        name: nextPrayerObj.name,
        time: nextPrayerObj.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } else {
      // If all prayers for today have passed, next prayer is Fajr tomorrow
      setNextPrayer({ name: 'Fajr (Tomorrow)', time: prayers[0].time });
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 flex items-center justify-center">
        <FaSpinner className="animate-spin text-white mr-2" />
        <span>Loading prayer times...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 px-4 flex items-center justify-between">
        <div className="flex items-center">
          <FaMosque className="mr-2" />
          <span>Prayer Times</span>
        </div>
        <div className="text-white text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-1 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center text-sm">
          <FaMosque className="mr-2" />
          <span>Prayer Times</span>
          {location && (
            <span className="ml-2 opacity-80 text-xs">
              <FaLocationArrow className="inline mr-1" size={10} /> {location}
            </span>
          )}
        </div>

        <div className="flex items-center">
          {nextPrayer && (
            <div className="bg-white/20 px-2 py-0.5 rounded text-xs mx-2">
              <span className="font-bold">{nextPrayer.name}:</span> {nextPrayer.time}
            </div>
          )}
          <span className="text-xs">{hijriDate}</span>
        </div>
      </div>

      {prayerTimes && (
        <div className="grid grid-cols-6 gap-1 text-center py-1 text-xs">
          <div>
            <div className="font-medium">Fajr</div>
            <div className="bg-white/10 px-1 py-0.5 rounded">{prayerTimes.Fajr}</div>
          </div>
          <div>
            <div className="font-medium">Sunrise</div>
            <div className="bg-white/10 px-1 py-0.5 rounded">{prayerTimes.Sunrise}</div>
          </div>
          <div>
            <div className="font-medium">Dhuhr</div>
            <div className="bg-white/10 px-1 py-0.5 rounded">{prayerTimes.Dhuhr}</div>
          </div>
          <div>
            <div className="font-medium">Asr</div>
            <div className="bg-white/10 px-1 py-0.5 rounded">{prayerTimes.Asr}</div>
          </div>
          <div>
            <div className="font-medium">Maghrib</div>
            <div className="bg-white/10 px-1 py-0.5 rounded">{prayerTimes.Maghrib}</div>
          </div>
          <div>
            <div className="font-medium">Isha</div>
            <div className="bg-white/10 px-1 py-0.5 rounded">{prayerTimes.Isha}</div>
          </div>
        </div>
      )}
    </div>
  );
}
