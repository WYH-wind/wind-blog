-- CreateIndex
CREATE INDEX "Post_title_idx" ON "Post" USING GIN ("title" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Post_summary_idx" ON "Post" USING GIN ("summary" gin_trgm_ops);
