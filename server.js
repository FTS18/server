import cors from 'cors';
import express from 'express';
import ytdl from 'ytdl-core';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
    try {
        // Add a message to indicate that the server is active
        res.send('Server is active!');

        const { URL, title, format } = req.query;
        const stream = ytdl(URL);

        stream.on("info", (info) => {
            const videoFormat = ytdl.chooseFormat(info.formats, { quality: '18' });
            const audioFormat = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });

            if (format === 'mp4') {
                res.header('Content-Disposition', `attachment; filename="${title}.mp4"`);
                ytdl(URL, { format: videoFormat }).pipe(res);
            } else if (format === 'mp3') {
                res.header('Content-Disposition', `attachment; filename="${title}.mp3"`);
                ytdl(URL, { format: audioFormat, filter: 'audioonly' }).pipe(res);
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
});

export default app;
