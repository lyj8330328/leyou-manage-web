<template>
  <v-card>
      <v-flex xs12 sm10>
        <v-tree ref="tree"  url="/item/category/list"
                :isEdit="isEdit"
                @handleAdd="handleAdd"
                @handleEdit="handleEdit"
                @handleDelete="handleDelete"
                @handleClick="handleClick"
        />
      </v-flex>
  </v-card>
</template>

<script>
  export default {
    name: "category",
    data() {
      return {
        //treeData: treeData,
        isEdit:true,
        leafNode:[],
      }
    },
    methods: {
      handleAdd(node) {
        console.log(node);
        if (node.parentId !== 0) {
          this.$http({
            method: 'post',
            url: '/item/category',
            data: this.$qs.stringify(node)
          }).then(() => {
            console.log("刷新");
            this.reloadData(node.id);
          }).catch();
        }else {
          this.$message.error("刷新后重试！");
        }
      },
      handleEdit(id,name) {
        const node={
          id:id,
          name:name
        };
        this.$http({
          method: 'put',
          url: '/item/category',
          data: this.$qs.stringify(node)
        }).then(() => {
          this.$message.info("修改成功！");
        }).catch(() => {
          this.$message.info("修改失败！");
        });
      },
      handleDelete(id) {
        //console.log("delete ... " + id);
        this.$http.delete("/item/category/cid/" + id).then(() => {
          this.$message.info("删除成功！");
        }).catch(() => {
          this.$message.info("删除失败！");
        })
      },
      handleClick(node) {
        console.log(node)
      },
      reloadData(id){
        //操作完成后刷新数据
        this.$http.get("/item/category/list?pid="+id).then().catch();
      }
    }
  };
</script>

<style scoped>

</style>
