WITH RECURSIVE ancestors AS (
    -- base case: assign stream_id to each direct parent
    SELECT e.source                          AS node_id,
           ROW_NUMBER() OVER (ORDER BY e.id) AS stream_id,
           1                                 AS depth
    FROM edges e
    WHERE e.target = :node_id

    UNION ALL

    -- recursive: inherit stream_id from child
    SELECT e.source,
           a.stream_id,
           a.depth + 1
    FROM edges e
             INNER JOIN ancestors a ON e.target = a.node_id
             INNER JOIN nodes n ON n.id = a.node_id
    WHERE n.type != 'mergeNode')
SELECT a.depth,
       a.stream_id,
       n.type,
       n.data
FROM nodes n
         INNER JOIN ancestors a ON n.id = a.node_id
ORDER BY a.stream_id, a.depth Desc