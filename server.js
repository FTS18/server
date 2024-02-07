import cors from 'cors';
import ytdl from 'ytdl-core';

const corsOptions = {
  origin: 'https://localhost:5501', // Allow requests from this origin
  methods: ['GET', 'POST'],      // Allow only specified HTTP methods
};

export default async function handler(req, res) {
  try {
    const { URL, title, format } = req.query;
    const stream = ytdl(URL);
    stream.on("info", (info) => {
      const videoFormat = ytdl.chooseFormat(info.formats, { quality: '18' });
      const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
      if (format === 'mp4') {
        res.setHeader('Content-Disposition', `attachment; filename="${title}.mp4"`);
        ytdl(URL, {
          format: videoFormat
        }).pipe(res);
      } else if (format === 'mp3') {
        res.setHeader('Content-Disposition', `attachment; filename="${title}.mp3"`);
        ytdl(URL, {
          format: audioFormat,
          filter: 'audioonly',
        }).pipe(res);
      }
    });
    stream.on("complete", () => {
      console.log(`${title} already downloaded!`);
    });
    stream.on('finish', () => {
      console.log('Video saved successfully!');
    });
  } catch (err) {
    console.error('Error in the download function:', err);
    res.status(500).send('Internal Server Error: ' + err.message);
  }
}
