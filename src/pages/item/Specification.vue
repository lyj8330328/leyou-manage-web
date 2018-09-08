<template>
  <v-card>
    <v-flex xs12 sm10>
      <v-card-title>选择分类，查看规格参数模板：</v-card-title>
      <v-tree url="/item/category/list"
              :isEdit="false"
              @handleClick="handleClick"
      />
      <v-dialog v-model="dialog" width="660px" scrollable persistent>
        <v-card>
          <v-toolbar dense tabs>
            <!-- 面包屑，显示当前分类信息-->
            <v-toolbar-title>
              <v-breadcrumbs>
                <v-icon slot="divider">chevron_right</v-icon>
                <v-breadcrumbs-item v-for="(p,index) in currentNode.path" :key="index">{{p}}</v-breadcrumbs-item>
              </v-breadcrumbs>
            </v-toolbar-title>
            <v-spacer/>
            <v-btn icon @click="close">
              <v-icon>clear</v-icon>
            </v-btn>
          </v-toolbar>
          <!--中间规格内容展示-->
          <v-card-text>
            <v-container fluid grid-list-md>
              <v-layout row wrap>
                <v-flex xs12>
                  <v-card v-for="(spec,index) in specifications" :key="index" class="my-3">
                    <v-card-title>
                      <strong><input type="text" style="font-size: 16px" v-model="spec.group"
                                     placeholder="请输入分组名称"></strong>
                      <v-spacer/>
                      <v-btn @click="deleteGroup(index)" small icon><i class="el-icon-delete"></i></v-btn>
                    </v-card-title>
                    <v-divider/>
                    <v-card-text class="px-5">
                      <v-expansion-panel inset>
                        <v-expansion-panel-content v-for="(param,i) in spec.params" :key="i">
                          <v-layout wrap row slot="header">
                            <input placeholder="请输入属性名" size="15" v-model="param.k" @click.stop=""/>
                            <v-spacer/>
                            <v-btn @click.stop="deleteParam(index,i)" small icon>
                              <i class="el-icon-delete" @click.stop="deleteParam(index,i)"></i>
                            </v-btn>
                          </v-layout>
                          <v-card class="mx-5">
                            <v-layout row>
                              <v-checkbox color="success" v-model="param.searchable" label="是否是可搜索"/>
                              <v-checkbox color="success" v-model="param.global" label="是否全局属性"/>
                            </v-layout>
                            <v-layout row>
                              <v-checkbox color="success" v-model="param.numerical" label="是否数值类型"/>
                              <v-text-field v-show="param.numerical" label="计量单位" v-model="param.unit" />
                            </v-layout>
                            <v-card-text v-if="param.options.length > 0">
                              <v-layout row v-for="j in param.options.length" :key="j">
                                <input placeholder="请输入选项值" v-model="param.options[j-1]"/>
                                <v-spacer/>
                                <v-btn small @click="deleteOption(index,i,j - 1)" icon>
                                  <i class="el-icon-delete"></i>
                                </v-btn>
                              </v-layout>
                            </v-card-text>
                            <v-alert v-else outline color="info" icon="info" :value="true">
                              尚未添加任何默认选项.
                            </v-alert>
                            <v-card-text style="line-height: 20px">
                              <v-layout row>
                                <v-flex offset-xs10>
                                  <v-btn depressed fab small @click="addOption(index,i)">
                                    <v-icon>add</v-icon>
                                  </v-btn>
                                </v-flex>
                              </v-layout>
                            </v-card-text>
                          </v-card>
                        </v-expansion-panel-content>
                      </v-expansion-panel>
                    </v-card-text>
                    <v-card-actions>
                      <v-flex offset-xs8>
                        <v-btn small @click="addParam(index)">添加新属性</v-btn>
                      </v-flex>
                    </v-card-actions>
                  </v-card>
                </v-flex>
              </v-layout>
            </v-container>
          </v-card-text>
          <!--底部按钮-->
          <v-card-actions class="elevation-10">
            <v-flex offset-xs4 xs4>
              <v-btn block center color="primary" @click="saveTemplate">保存规格模板</v-btn>
            </v-flex>
            <v-flex offset-xs1 xs1>
              <v-btn small @click="addGroup">
                添加新分组
              </v-btn>
            </v-flex>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-flex>
  </v-card>
</template>

<script>
  import config from '../../config'
//  import {treeData,phoneSpec} from "../../mockDB";

  export default {
    name: "v-template",
    data() {
      return {
        specifications: [], // 当前分类的规格参数信息
        oldSpec: [],// 修改前的规格参数信息
        dialog: false, // 是否弹出对话框，默认是false，隐藏对话框
        currentNode: {},// 当前被选中的商品分类节点
        units:config.unitOption// 数值类型的可选单位
      }
    },
    methods: {
      // 分类点击后的弹窗
      handleClick(node) {
        // 把当前点击IDE节点记录下来
        this.currentNode = node;
        // 判断点击的节点是否是父节点（只有点击到叶子节点才会弹窗）
        if (!node.isParent) {
          // 如果是叶子节点，那么就发起ajax请求，去后台查询商品规格数据。
          this.$http.get("/item/spec/" + node.id)
            .then(resp => {
              console.log(resp.data)
              // 查询成功后，把响应结果赋值给specifications属性，Vue会进行自动渲染。
              this.specifications = resp.data;
              // 记录下此时的规格数据，当页面撤销修改时，用来恢复原始数据
              this.oldSpec = resp.data;
              // 打开弹窗
              this.dialog = true;
            })
            .catch(() => {
              // 如果没有查询成功，那么询问是否添加规格
              this.$message.confirm('该分类还没有规格参数，是否添加?')
                .then(() => {
                  // 如果要添加，则将specifications初始化为空
                  this.specifications = [{
                    group: '',
                    params: []
                  }];
                  // 打开弹窗
                  this.dialog = true;
                  // 标记为新增
                  this.isInsert = true;
                })
            })
        }
      },
      //添加分组
      addGroup() {
        this.specifications.push({
          group: '',
          params: []
        })
      },
      // 添加新属性
      addParam(i) {
        this.specifications[i].params.push({
          k: "",
          searchable: false,
          global: true,
          numerical:false,
          unit:"",
          options: []
        })
      },
      // 为属性添加默认值
      addOption(i, j) {
        this.specifications[i].params[j].options.push("")
      },
      // 保存、修改、删除模板
      saveTemplate() {
        this.dialog = true;

        //模板删除
        if (this.specifications.length === 0){
          //console.log("删除:"+this.currentNode.id);
          this.$http.delete("/item/spec/"+this.currentNode.id).then(() => {
            this.dialog = false;
            this.$message.success("删除成功！");
            this.oldSpec = [];
          }).catch(() => {
            this.$message.error("删除失败");
          });
        }else {
          this.$http({
            method: this.oldSpec.length === 0 ? 'post' : 'put',
            url: '/item/spec',
            data: this.$qs.stringify({
              categoryId: this.currentNode.id,
              specifications: JSON.stringify(this.specifications)
            })
          })
            .then(() => {
              this.dialog = false;
              this.$message.success("保存成功！")
              this.oldSpec = [];
            })
            .catch(() => {
              this.$message.error("保存失败！")
            });
        }
      },
      deleteGroup(i) {
        this.specifications.splice(i, 1)
      },
      // 删除指定模板
      deleteParam(i, j) {
        this.specifications[i].params.splice(j, 1);
      },
      // 删除指定值
      deleteOption(i1, i2, i3) {
        this.specifications[i1].params[i2].options.splice(i3, 1);
      },

      //关闭对话框
      close(){
        this.oldSpec = [];
        this.dialog = false;
      }
    }
  }
</script>

<style scoped>
  label {
    font-size: 14px;
    color: #111;
  }

  input {
    font-size: 15px;
  }
</style>
