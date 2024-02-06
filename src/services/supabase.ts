import { AbstractFileService, Logger, MedusaContainer } from "@medusajs/medusa";
import {
  DeleteFileType,
  FileServiceGetUploadStreamResult,
  FileServiceUploadResult,
  GetUploadedFileType,
  UploadStreamDescriptorType,
} from "@medusajs/types";
import { StorageClient } from "@supabase/storage-js";
import { randomUUID } from "crypto";
import { createReadStream } from "fs";

class SupabaseFileService extends AbstractFileService {
  logger: Logger;
  storageClient: StorageClient;
  bucket: string;
  signedUrlExpiration = 120;
  storageUrl: string;

  constructor(container: any, config: Record<string, unknown> | undefined) {
    super(container);
    const bucket: string =
      (config?.bucketName as string) || process.env.BUCKET_NAME;
    const referenceID: string =
      (config?.referenceID as string) || process.env.STORAGE_BUCKET_REF;
    const serviceKey: string =
      (config?.serviceKey as string) || process.env.STORAGE_SERVICE_KEY;
    this.logger = container.logger as Logger;
    this.bucket = bucket;
    this.storageUrl = `https://${referenceID}.supabase.co/storage/v1/object/public`;
    this.storageClient = new StorageClient(
      `https://${referenceID}.supabase.co/storage/v1`,
      {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      }
    );
  }

  async upload(
    fileData: Express.Multer.File
  ): Promise<FileServiceUploadResult> {
    const { data, error } = await this.storageClient
      .from(this.bucket)
      .upload(
        `assets/${randomUUID()}.${fileData.originalname.split(".").pop()}`,
        createReadStream(fileData.path),
        { contentType: fileData.mimetype, duplex: "half" }
      );

    if (error) {
      this.logger.error(error);
      throw new Error("Error uploading file");
    }

    return {
      key: data.path,
      url: `${this.storageUrl}/${this.bucket}/${data.path}`,
    };
  }

  async uploadProtected(
    fileData: Express.Multer.File
  ): Promise<FileServiceUploadResult> {
    const { data, error } = await this.storageClient
      .from(this.bucket)
      .upload(
        `private/${randomUUID()}.${fileData.originalname.split(".").pop()}`,
        createReadStream(fileData.path),
        { contentType: fileData.mimetype, duplex: "half" }
      );

    if (error) {
      this.logger.error(error);
      throw new Error("Error uploading file");
    }

    const signedURLResult = await this.storageClient
      .from(this.bucket)
      .createSignedUrl(data.path, this.signedUrlExpiration);

    if (signedURLResult.error) {
      this.logger.error(signedURLResult.error);
      throw new Error("Error getting presigned url");
    }

    return {
      key: data.path,
      url: signedURLResult.data.signedUrl,
    };
  }

  async delete(fileData: DeleteFileType): Promise<void> {
    const { error } = await this.storageClient
      .from(this.bucket)
      .remove([fileData.fileKey]);

    if (error) {
      this.logger.error(error);
      throw new Error("Error deleting file");
    }
  }

  async getUploadStreamDescriptor(
    fileData: UploadStreamDescriptorType
  ): Promise<FileServiceGetUploadStreamResult> {
    throw new Error("Method not implemented.");
  }

  async getDownloadStream(
    fileData: GetUploadedFileType
  ): Promise<NodeJS.ReadableStream> {
    const { data, error } = await this.storageClient
      .from(this.bucket)
      .download(fileData.fileKey);

    if (error) {
      this.logger.error(error);
      throw new Error("Error getting download stream");
    }

    return data.stream();
  }

  async getPresignedDownloadUrl(
    fileData: GetUploadedFileType
  ): Promise<string> {
    const { data, error } = await this.storageClient
      .from(this.bucket)
      .createSignedUrl(fileData.fileKey, this.signedUrlExpiration);
    this.logger.info(fileData);
    if (error) {
      this.logger.error(error);
      throw new Error("Error getting presigned url");
    }

    return data.signedUrl;
  }
}

export default SupabaseFileService;
