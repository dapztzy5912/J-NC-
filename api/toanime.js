import axios from 'axios';
import FormData from 'form-data';
import formidable from 'formidable-serverless';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Metode tidak diizinkan' });

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    try {
      if (err) throw 'Gagal parsing form';

      const file = files.file;
      const buffer = fs.readFileSync(file.filepath);
      const filename = file.originalFilename;

      const formUpload = new FormData();
      formUpload.append('files[]', buffer, { filename });

      const { data } = await axios.post('https://uguu.se/upload.php', formUpload, {
        headers: formUpload.getHeaders(),
      });

      if (!data.files || !data.files[0]) throw 'Upload ke Uguu gagal';

      const uploadedUrl = data.files[0].url;

      const animeImageUrl = `https://fgsi1-restapi.hf.space/api/ai/toAnime?url=${encodeURIComponent(uploadedUrl)}`;

      res.status(200).json({ result: animeImageUrl });
    } catch (e) {
      res.status(500).json({ error: e.toString() });
    }
  });
}
