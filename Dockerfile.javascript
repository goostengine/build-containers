ARG img_version
FROM godot-mono:${img_version}

ARG mono_version

RUN if [ -z "${mono_version}" ]; then printf "\n\nArgument mono_version is mandatory!\n\n"; exit 1; fi && \
    dnf -y install --setopt=install_weak_deps=False \
      java-openjdk yasm && \
    git clone --progress https://github.com/emscripten-core/emsdk && \
    cd emsdk && \
    git checkout 85cf370a74b4065f9411e707900f0895fa8f14a1 && \
    ./emsdk install 1.39.7 && \
    ./emsdk activate 1.39.7 && \
    echo "source /root/emsdk/emsdk_env.sh" >> /root/.bashrc

RUN cp -a /root/files/${mono_version} /root && \
    cd /root/${mono_version} && \
    export MONO_SOURCE_ROOT=/root/${mono_version} && \
    cd /root/${mono_version}/godot-mono-builds && \
    python3 patch_emscripten.py && \
    python3 wasm.py configure -j --target=runtime && \
    python3 wasm.py make -j --target=runtime && \
    cd /root/${mono_version} && git clean -fdx && NOCONFIGURE=1 ./autogen.sh && \
    cd /root/${mono_version}/godot-mono-builds && \
    python3 bcl.py make -j --product wasm && \
    cd /root && \
    rm -rf /root/${mono_version}

CMD /bin/bash
