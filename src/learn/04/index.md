经常会有输出要保留N位小数的情况，比如：[1046 圆的面积](https://oj.xuyue.cc/problem/1046) 这道题需要保留4位小数

## "%.2f" % 方法

使用方法如下：

```py
a=1.23456

print("%.4f" % a)
print("%.3f" % a)
print("%.2f" % a)
```

得到的结果

```py
1.2346
1.235
1.23
```

这个方法**会进行四舍五入**

### 注意："%.2f" % 后面只能跟着一个变量或运算结果，不能跟着计算表达式

下面代码运行会**报错**：

```py
a=10
b=3
print("%.2f" % a/b) # 这里是错误的❌
```

可以改成：

```py
a=10
b=3
c=a/b
print("%.2f" % c) # 这样是正确的✔
```

或者，把计算表达式用括号包起来

```py
a=10
b=3
print("%.2f" % (a/b)) # 这样是正确的✔
```

## format() 函数

使用方法如下：

```py
a=1.23456

print(format(a, ".4f"))
print(format(a, ".3f"))
print(format(a, ".2f"))
```

**不要忘记小数点**

得到的结果

```py
1.2346
1.235
1.23
```

这个方法**会进行四舍五入**