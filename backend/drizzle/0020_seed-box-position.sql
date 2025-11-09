-- Custom SQL migration file, put your code below! --
update "chunkBoxPosition" as cbp
set "pageNo" = (select dc."pageNumber" 
    from "documentChunks" as dc
    where dc.id = cbp."chunkId");
