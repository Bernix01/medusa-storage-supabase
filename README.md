# medusa-storage-supabase

Handle file uploads with supabase

[Medusa Website](https://medusajs.com/) | [Medusa Repository](https://github.com/medusajs/medusa)

## Features

- Upload files to `assets/` and private files to `private/`.
- Get file signed url
- Delete file

---

## Prerequisites

- [Node.js v17 or greater](https://nodejs.org/en)
- [A Medusa backend](https://docs.medusajs.com/development/backend/install)
- [Supabase account](https://supabase.com/)
- Supabase storage bucket. **Do not set it to public** as this plugin handles signed urls.

---

## How to Install

1\. Run the following command in the directory of the Medusa backend:

```bash
npm install medusa-storage-supabase
```

2\. Set the following environment variables in `.env`:

```dotenv
STORAGE_BUCKET_REF=<found in the settings>
STORAGE_SERVICE_KEY=<this is the service role key, not the public>
BUCKET_NAME=<bucket name>
```

3\. In `medusa-config.js` add the following at the end of the `plugins` array:

```js
const plugins = [
  // ...
  {
    resolve: `medusa-storage-supabase`,
    options: {
      referenceID: process.env.STORAGE_BUCKET_REF,
      serviceKey: process.env.STORAGE_SERVICE_KEY,
      bucketName: process.env.BUCKET_NAME,
    },
  },
];
```

---

## Test the Plugin

1\. Run the following command in the directory of the Medusa backend to run the backend:

```bash
npm start
```

2\. Try to change a product image.

---

## Additional Resources

- [Supabase storage js](https://github.com/supabase/storage-js)
